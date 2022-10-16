import Tabs from './lib/tabs';
import Utils from './lib/utils';
import { BackgroundRequest, BackgroundResponse, ContentRequest, Status } from './lib/values';

const playButton = document.querySelector('.fjs-play') as HTMLButtonElement;
const pauseButton = document.querySelector('.fjs-pause') as HTMLButtonElement;
const stopButton = document.querySelector('.fjs-stop') as HTMLButtonElement;

const progressElement = document.getElementById('progress') as HTMLProgressElement;

Tabs.current()
	.then(async tab => {
		const orderId = await getOrderId(tab);
		const status = await requestStatus();

		return init(orderId, tab);
	})
	.catch(console.error);

chrome.runtime.onMessage.addListener((message: { key: string, value: any }) => {
	switch (message.key) {
		case BackgroundResponse.PROGRESS:
			setProgress(message.value);

			break;
		case BackgroundResponse.STATUS:
			toggleButtons(message.value);

			break;
	}
});

function setProgress(progress: number) {
	progressElement.setAttribute('value', progress.toString());
	progressElement.textContent = `${progress}%`;
}

function toggleButtons(status: Status) {
	console.log('toggleButtons', status);

	switch (status) {
		case Status.NOT_STARTED:
			playButton.disabled = false;
			pauseButton.disabled = true;
			stopButton.disabled = true;

			break;
		case Status.STARTED:
			playButton.disabled = true;
			pauseButton.disabled = false;
			stopButton.disabled = false;

			break;
		case Status.PAUSED:
			playButton.disabled = false;
			pauseButton.disabled = true;
			stopButton.disabled = false;

			break;
		case Status.STOPPED:
		case Status.FINISHED:
			playButton.disabled = false;
			pauseButton.disabled = true;
			stopButton.disabled = true;
	}
}

function getOrderId(tab: chrome.tabs.Tab): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!Utils.isSet(tab.id)) {
			reject('Tab has no id');
		} else {
			chrome.tabs.sendMessage(tab.id, ContentRequest.ORDER_ID, response => {
				if (!Utils.isSet(response)) {
					reject('No order id found');
				} else {
					resolve(response);
				}
			});
		}
	});
}

function requestStatus() {
	return sendMessageToBackground(BackgroundRequest.STATUS);
}

function init(orderId: string, tab: chrome.tabs.Tab) {
	if (!tab.url) {
		return;
	}

	const url = new URL(tab.url);
	const catalogId = url.searchParams.get('catalogId');
	const storeId = url.searchParams.get('storeId');
	const langId = url.searchParams.get('langId');

	if (!Utils.isSet(catalogId) || !Utils.isSet(storeId) || !Utils.isSet(langId)) {
		return;
	}

	playButton.removeAttribute('disabled');

	playButton.addEventListener('click', () => {
		sendMessageToBackground(BackgroundRequest.PLAY, { url: tab.url, orderId, catalogId, storeId, langId })
			.then(response => toggleButtons(response));
	});

	pauseButton.addEventListener('click', pause);
	stopButton.addEventListener('click', stop);
}

function pause() {
	sendMessageToBackground(BackgroundRequest.PAUSE)
		.then(response => toggleButtons(response));
}

function stop() {
	sendMessageToBackground(BackgroundRequest.STOP)
		.then(response => toggleButtons(response));
}

function sendMessageToBackground<Value = unknown>(key: BackgroundRequest, value?: Value): Promise<Status> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ key, value }, (response: Status) => {
			console.log('chrome.runtime.sendMessage', key, response, chrome.runtime.lastError);

			if (chrome.runtime.lastError) {
				return reject();
			}

			return resolve(response);
		});
	});
}
