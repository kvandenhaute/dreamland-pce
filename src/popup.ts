import SearchProgress from './lib/classes/SearchProgress.class';
import Messages from './lib/messages';
import Tabs from './lib/tabs';
import Utils from './lib/utils';
import { Connection, ContentRequest, ServiceWorkerRequest } from './lib/values';

chrome.runtime.connect({ name: Connection.POPUP });

Tabs.current()
	.then(async tab => {
		if (!Utils.isSet(tab.url)) {
			return false;
		}

		const orderId = await getOrderId(tab);

		if (!Utils.isSet(orderId)) {
			return requestOrders(tab.url);
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

async function requestOrders(url: string): Promise<void> {
	const orderIds = await Messages.serviceWorkerRequest<Array<string>>(ServiceWorkerRequest.LIST);

	orderIds.map(orderId => SearchProgress.builder(url, orderId));
}
