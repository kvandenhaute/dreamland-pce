import type { ShoppingCardRequestMessage, ShoppingCardResponseMessage } from './types';
import type { ServiceWorkerRequest, ServiceWorkerResponse, Status } from './values';

function sendServiceWorkerRequest<Response>(key: ServiceWorkerRequest): Promise<Response> {
	return sendRuntimeMessage<Response>({ key });
}

function sendShoppingCardRequest<Value>(orderId: string, key: ServiceWorkerRequest, value?: Value): Promise<any> {
	const message: ShoppingCardRequestMessage = {
		key,
		body: { orderId, value }
	};

	return sendRuntimeMessage<Status>(message);
}

function sendShoppingCardResponse<Value>(orderId: string, key: ServiceWorkerResponse, value: Value): void {
	const message: ShoppingCardResponseMessage = {
		key,
		body: { orderId, value }
	};

	chrome.runtime.sendMessage(message);
}

export default {
	serviceWorkerRequest: sendServiceWorkerRequest,
	sendToShoppingCard: sendShoppingCardResponse,
	shoppingCardRequest: sendShoppingCardRequest
};

function sendRuntimeMessage<Response, Message = unknown>(message: Message): Promise<Response> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, response => {
			console.log('chrome.runtime.sendMessage', message, response);

			if (chrome.runtime.lastError) {
				console.log('lastError', chrome.runtime.lastError);

				return reject();
			}

			return resolve(response);
		});
	});
}
