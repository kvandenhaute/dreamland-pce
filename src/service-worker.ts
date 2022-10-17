import type { SearchParams, ServiceWorkerRequestMessage, ShoppingCardRequestMessage } from './lib/types';

import ShoppingCard from './lib/classes/ShoppingCard.class';
import Utils from './lib/utils';
import { ServiceWorkerRequest, Status } from './lib/values';

const shoppingCards: Map<string, ShoppingCard> = new Map();

let popupOpen: boolean = false;

chrome.runtime.onConnect.addListener(port => {
	console.log('onConnect', port);

	if (port.name === 'popup') {
		popupOpen = true;

		setCanSendProgress();

		port.onDisconnect.addListener(() => {
			console.log('popup has been closed');

			popupOpen = false;

			setCanSendProgress();
		});
	}
});

function setCanSendProgress() {
	for (const card of shoppingCards.values()) {
		card.setCanSendProgress(popupOpen);
	}
}

chrome.runtime.onMessage.addListener((message: ServiceWorkerRequestMessage | ShoppingCardRequestMessage, sender, sendResponse) => {
	if (isShoppingCardRequestMessage(message)) {
		return shoppingCardMessageHandler(message, sendResponse);
	}

	return serviceWorkerRequestMessage(message, sendResponse);
});

function serviceWorkerRequestMessage(message: ServiceWorkerRequestMessage, sendResponse: SendResponse<unknown>): void {
	switch (message.key) {
		case ServiceWorkerRequest.LIST:
			sendResponse(Array.from(shoppingCards.keys()));

			break;
		default:
			sendResponse(null);
	}
}

function shoppingCardMessageHandler({ key, body }: ShoppingCardRequestMessage, sendResponse: SendResponse<any>): void {
	switch (key) {
		case ServiceWorkerRequest.PLAY:
			play(body.orderId, body.value, sendResponse);

			break;
		case ServiceWorkerRequest.PAUSE:
			pause(body.orderId, sendResponse);

			break;
		case ServiceWorkerRequest.RESUME:
			resume(body.orderId, sendResponse);

			break;
		case ServiceWorkerRequest.STOP:
			stop(body.orderId, sendResponse);

			break;
		case ServiceWorkerRequest.STATUS:
			sendStatus(body.orderId, sendResponse);

			break;
		case ServiceWorkerRequest.PROGRESS:
			sendProgress(body.orderId, sendResponse);

			break;
		default:
			sendResponse(Status.NOT_STARTED);
	}
}

function play(orderId: string, searchParams: SearchParams, sendResponse: SendResponse<Status>): void {
	const card = getShoppingCard(orderId);

	card.play(searchParams);

	sendResponse(card.getStatus());
}

function pause(orderId: string, sendResponse: SendResponse<Status>): void {
	const card = getShoppingCard(orderId);

	card.pause();

	sendResponse(card.getStatus());
}

function resume(orderId: string, sendResponse: SendResponse<Status>): void {
	const card = getShoppingCard(orderId);

	card.resume();

	sendResponse(card.getStatus());
}

function stop(orderId: string, sendResponse: SendResponse<Status>): void {
	const card = getShoppingCard(orderId);

	card.stop();

	sendResponse(card.getStatus());
}

interface SendResponse<T> {
	(status: T): void;
}

function sendStatus(orderId: string, sendResponse: SendResponse<Status>): void {
	const card = getShoppingCard(orderId);

	sendResponse(card.getStatus());
}

function sendProgress(orderId: string, sendResponse: SendResponse<number>): void {
	const card = getShoppingCard(orderId);

	console.log('sendProgress', orderId, card.getProgress())

	sendResponse(card.getProgress());
}

function getShoppingCard(orderId: string) {
	let card = shoppingCards.get(orderId);

	if (!Utils.isSet(card)) {
		card = createShoppingCard(orderId);
	}

	return card;
}

function createShoppingCard(orderId: string): ShoppingCard {
	const card = new ShoppingCard(orderId, popupOpen);

	shoppingCards.set(orderId, card);

	return card;
}

function isShoppingCardRequestMessage(message: any): message is ShoppingCardRequestMessage {
	return typeof message === 'object' && Utils.isSet(message.body) && 'orderId' in message.body;
}
