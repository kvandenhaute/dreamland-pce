export enum BackgroundRequest {
	PLAY = 'start-searching',
	PAUSE = 'pause-searching',
	STOP = 'stop-searching',
	STATUS = 'background-status'
}

export enum BackgroundResponse {
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
