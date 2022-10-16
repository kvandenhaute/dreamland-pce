import type { AjaxActionResponse, SearchParams } from './lib/types';

import Utils from './lib/utils';
import { BackgroundRequest, BackgroundResponse, Status } from './lib/values';

let status: Status = Status.NOT_STARTED;
let codesToCheck: Array<string> = [];
let totalCodesToCheck: number = 0;
let possibleDiscountCodes: Array<string> = [];

chrome.runtime.onMessage.addListener(({ key, value }: { key: BackgroundRequest, value?: any }, sender, sendResponse) => {
	switch (key) {
		case BackgroundRequest.PLAY:
			play(value);

			break;
		case BackgroundRequest.PAUSE:
			pause();

			break;
		case BackgroundRequest.STOP:
			stop();

			break;
		case BackgroundRequest.STATUS:
			sendStatus();

			break;
	}

	return sendResponse(status);
});

function play(params: SearchParams) {
	if (status === Status.NOT_STARTED) {
		codesToCheck = generateCodes();
		totalCodesToCheck = codesToCheck.length;
		possibleDiscountCodes = [];

		status = Status.STARTED;
	}

	return tryCode(params);
}

function pause() {
	status = Status.PAUSED;
}

function stop() {
	status = Status.STOPPED;
}

function sendStatus() {
	chrome.runtime.sendMessage({
		key: BackgroundResponse.STATUS,
		value: status
	});
}

function sendProgress() {
	const totalCodesLeftToCheck = codesToCheck.length;
	const totalCodesChecked = totalCodesToCheck - totalCodesLeftToCheck;

	chrome.runtime.sendMessage({
		key: BackgroundResponse.PROGRESS,
		value: totalCodesChecked / totalCodesToCheck * 100
	});
}

function tryCode(params: SearchParams) {
	if (status !== Status.STARTED) {
		return;
	}

	sendProgress();

	const code = codesToCheck.shift();

	if (!Utils.isSet(code)) {
		status = Status.FINISHED;

		return;
	}

	fetch('https://www.dreamland.be/e/nl/CommonOrderItemCmd', {
		headers: {
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		method: 'POST',
		body: `orderId=${params.orderId}&catalogId=${params.catalogId}&storeId=${params.storeId}&langId=${params.langId}&quickAddCode=${code}&actionType=QA`,
		referrer: params.url
	})
		.then(response => response.text())
		.then(body => parseBody(body))
		.then(response => processResponse(response))
		.then(() => tryCode(params));
}

function parseBody(body: string): AjaxActionResponse {
	return JSON.parse(body.replace(/(\/\*|\*\/)/g, ''));
}

function processResponse(response: AjaxActionResponse) {
	if (Utils.isSet(response.errorCode)) {
		return;
	}

	possibleDiscountCodes.push(response.quickAddCode);
}

function generateCodes(): Array<string> {
	const codes: Array<string> = [];
	// const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	const letters = 'A'.split('');

	for (const letter of letters) {
		for (let i = 0; i < 100; i++) {
			codes.push(letter + i.toString().padStart(3, '0'));
		}
	}

	return codes;
}
