export enum ServiceWorkerRequest {
	LIST = 'LIST_REQUEST',
	PLAY = 'START_REQUEST',
	PAUSE = 'PAUSE_REQUEST',
	RESUME = 'RESUME_REQUEST',
	STOP = 'STOP_REQUEST',
	STATUS = 'STATUS_REQUEST',
	PROGRESS = 'PROGRESS_REQUEST'
}

export enum ServiceWorkerResponse {
	PROGRESS = 'PROGRESS_RESPONSE',
	STATUS = 'STATUS_RESPONSE'
}

export enum ContentRequest {
	ORDER_ID = 'ORDER_ID_REQUEST'
}

export enum Status {
	NOT_STARTED = 'NOT_STARTED',
	STARTED = 'STARTED',
	PAUSED = 'PAUSED',
	STOPPED = 'STOPPED',
	FINISHED = 'FINISHED'
}

export enum Connection {
	POPUP = 'DPCE_POPUP'
}

export enum PopupStatus {
	CLOSED,
	OPEN
}
