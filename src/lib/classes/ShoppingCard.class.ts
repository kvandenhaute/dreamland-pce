import type { AjaxActionResponse, SearchParams } from '../types';

import Messages from '../messages';
import Utils from '../utils';
import { PopupStatus, ServiceWorkerResponse, Status } from '../values';

export default class ShoppingCard {
	private readonly orderId: string;
	private popupStatus: PopupStatus = PopupStatus.CLOSED;

	private status: Status = Status.NOT_STARTED;
	private codesToCheck: Array<string> = [];
	private totalCodesToCheck: number = 0;
	private discountCodes: Array<string> = [];

	constructor(orderId: string, popupStatus: PopupStatus) {
		this.orderId = orderId;
		this.popupStatus = popupStatus;
	}

	play(searchParams: SearchParams): Promise<Status> {
		return this.generateCodes()
			.setStatus(Status.STARTED)
			.tryNextCode(searchParams);
	}

	pause(): this {
		return this.setStatus(Status.PAUSED);
	}

	resume(): this {
		return this.setStatus(Status.STARTED);
	}

	stop(): this {
		this.sendProgress();

		return this.setStatus(Status.STOPPED);
	}

	getProgress(): number {
		if (this.totalCodesToCheck === 0) {
			return 0;
		}

		const totalCodesLeftToCheck = this.codesToCheck.length;

		if (totalCodesLeftToCheck === 0) {
			return 100;
		}

		return (this.totalCodesToCheck - totalCodesLeftToCheck) / this.totalCodesToCheck * 100;
	}

	setPopupStatus(status: PopupStatus): this {
		this.popupStatus = status;

		return this;
	}

	private generateCodes(): this {
		this.codesToCheck = Utils.generateCodes();
		this.totalCodesToCheck = this.codesToCheck.length;
		this.discountCodes = [];

		return this;
	}

	private setStatus(status: Status): this {
		this.status = status;

		return this;
	}

	getStatus(): Status {
		return this.status;
	}

	private sendStatus() {
		if (this.popupStatus === PopupStatus.CLOSED) {
			return;
		}

		Messages.sendToShoppingCard(this.orderId, ServiceWorkerResponse.STATUS, this.getStatus());
	}

	private sendProgress() {
		if (this.popupStatus === PopupStatus.CLOSED) {
			return;
		}

		Messages.sendToShoppingCard(this.orderId, ServiceWorkerResponse.PROGRESS, this.getProgress());
	}

	private async tryNextCode(searchParams: SearchParams): Promise<Status> {
		if (this.status === Status.FINISHED) {
			return this.getStatus();
		} else if (this.status === Status.STOPPED) {
			return this.getStatus();
		} else if (this.status === Status.PAUSED) {
			return Utils.wait(100)
				.then(() => this.tryNextCode(searchParams));
		}

		const code = this.codesToCheck.shift();

		if (!Utils.isSet(code)) {
			this.status = Status.FINISHED;

			this.sendStatus()

			return Promise.resolve(this.getStatus());
		}

		const body = await this.fetch(searchParams, code)
			.then(body => this.parseBody(body))
			.catch(() => null);

		if (!Utils.isSet(body)) {
			this.codesToCheck.push(code);

			return this.tryNextCode(searchParams);
		} else if (body.errorCode) {
			this.sendProgress();

			return Utils.wait(400)
				.then(() => this.tryNextCode(searchParams));
		}

		this.discountCodes.push(body.quickAddCode);

		return Utils.wait(100)
			.then(() => this.tryNextCode(searchParams));
	}

	private fetch(searchParams: SearchParams, code: string): Promise<string> {
		return fetch('https://www.dreamland.be/e/nl/CommonOrderItemCmd', {
			headers: {
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			method: 'POST',
			body: `orderId=${this.orderId}&catalogId=${searchParams.catalogId}&storeId=${searchParams.storeId}&langId=${searchParams.langId}&quickAddCode=${code}&actionType=QA`,
			referrer: searchParams.url
		}).then(response => response.text());
	}

	private parseBody(body: string): AjaxActionResponse {
		return JSON.parse(body.replace(/(\/\*|\*\/)/g, ''));
	}
}
