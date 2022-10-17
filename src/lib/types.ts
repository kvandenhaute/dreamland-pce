import type { ServiceWorkerRequest, ServiceWorkerResponse } from './values';

export interface SearchParams {
	url: string;
	catalogId: string;
	storeId: string;
	langId: string;
}

export interface AjaxActionResponse {
	errorCode?: string;
	quickAddCode: string;
}

export interface Message<Key extends string, Body> {
	key: Key;
	body?: Body;
}

export interface ShoppingCardMessageBody {
	orderId: string;
	value: any;
}

export type ServiceWorkerRequestMessage<Value = undefined> = Message<ServiceWorkerRequest, Value>;
export type ServiceWorkerResponseMessage<Value = any> = Message<ServiceWorkerResponse, Value>;

export type ShoppingCardRequestMessage = Required<ServiceWorkerRequestMessage<ShoppingCardMessageBody>>;
export type ShoppingCardResponseMessage = ServiceWorkerResponseMessage<Required<ShoppingCardMessageBody>>;
