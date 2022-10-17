import type { AjaxActionResponse, SearchParams } from '../types';

import Utils from '../utils';
import { Status } from '../values';

export default class ShoppingCard {
	private readonly orderId: string;

	private status: Status = Status.NOT_STARTED;
	private codesToCheck: Array<string> = [];
	private totalCodesToCheck: number = 0;
	private discountCodes: Array<string> = [];

	constructor(orderId: string) {
		this.orderId = orderId;
	}

	play(searchParams: SearchParams): Promise<Status> {
		console.debug(this.orderId, Status.STARTED);

		return this.generateCodes()
			.setStatus(Status.STARTED)
			.tryNextCode(searchParams);
	}

	pause(): this {
		console.debug(this.orderId, Status.PAUSED);

		return this.setStatus(Status.PAUSED);
	}

	resume(): this {
		console.debug(this.orderId, Status.STARTED);

		return this.setStatus(Status.STARTED);
	}

	stop(): this {
		console.debug(this.orderId, Status.STOPPED);

		return this.setStatus(Status.STOPPED);
	}

	getProgress(): number {
		const totalCodesLeftToCheck = this.codesToCheck.length;
		const totalCodesChecked = this.totalCodesToCheck - totalCodesLeftToCheck;

		return totalCodesChecked / this.totalCodesToCheck * 100;
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

			return Promise.resolve(this.getStatus());
		}

		const body = await this.fetch(searchParams, code)
			.then(body => this.parseBody(body));

		if (body.errorCode) {
			return this.tryNextCode(searchParams);
		}

		this.discountCodes.push(body.quickAddCode);

		return this.tryNextCode(searchParams);
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
