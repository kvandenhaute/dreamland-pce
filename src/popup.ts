import SearchProgress from './lib/classes/SearchProgress.class';
import Messages from './lib/messages';
import Tabs from './lib/tabs';
import Utils from './lib/utils';
import { ContentRequest, ServiceWorkerRequest } from './lib/values';

Tabs.current()
	.then(async tab => {
		if (!Utils.isSet(tab.url)) {
			return false;
		}

		const orderId = await getOrderId(tab);

		if (!Utils.isSet(orderId)) {
			return requestOrders();
		}

		return SearchProgress.builder(tab.url, orderId)
			.then(() => console.info(`SearchProgress initialized for order ${orderId}`));
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
