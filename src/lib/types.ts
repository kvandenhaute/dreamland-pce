export interface SearchParams {
	url: string;
	orderId: string | number;
	catalogId: string | number;
	storeId: string | number;
	langId: string | number;
}

export interface AjaxActionResponse {
	errorCode?: string;
	quickAddCode: string;
}
