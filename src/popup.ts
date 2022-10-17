import SearchProgress from './lib/classes/SearchProgress.class';
import Messages from './lib/messages';
import Tabs from './lib/tabs';
import { ShoppingCardResponseMessage } from './lib/types';
import Utils from './lib/utils';
import { ContentRequest, ServiceWorkerRequest, ServiceWorkerResponse } from './lib/values';

chrome.runtime.connect({ name: 'popup' });

chrome.runtime.onMessage.addListener(message => {
	console.log('popup.ts', message);
});

Tabs.current()
	.then(async tab => {
		if (!Utils.isSet(tab.url)) {
			return false;
		}

		const orderId = await getOrderId(tab);

		if (!Utils.isSet(orderId)) {
			return requestOrders();
		}

		return SearchProgress.builder(tab.url, orderId);
	})
	.catch(console.error);

function getOrderId(tab: chrome.tabs.Tab): Promise<string | null> {
	return new Promise((resolve, reject) => {
		if (!Utils.isSet(tab.id)) {
			reject('Tab has no id');
		} else {
			chrome.tabs.sendMessage(tab.id, ContentRequest.ORDER_ID, response => {
				if (!Utils.isSet(response)) {
					resolve(null);
				} else {
					resolve(response);
				}
			});
		}
	});
}

function requestOrders() {
	console.log('requestOrders');

	Messages.serviceWorkerRequest(ServiceWorkerRequest.LIST)
		.then(console.log);
}
