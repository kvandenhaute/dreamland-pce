export enum ServiceWorkerRequest {
	LIST = 'LIST',
	PLAY = 'START',
	PAUSE = 'PAUSE',
	RESUME = 'RESUME',
	STOP = 'STOP',
	STATUS = 'STATUS',
	PROGRESS = 'PROGRESS'
}

export enum ServiceWorkerResponse {
	PROGRESS = 'progress',
	STATUS = 'status'
}

export enum ContentRequest {
	ORDER_ID = 'order-id'
}

export enum Status {
	NOT_STARTED = 'NOT_STARTED',
	STARTED = 'STARTED',
	PAUSED = 'PAUSED',
	STOPPED = 'STOPPED',
	FINISHED = 'FINISHED'
}
