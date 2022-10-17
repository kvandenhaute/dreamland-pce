import type { SearchParams, ShoppingCardResponseMessage } from '../types';

import Messages from '../messages';
import Utils from '../utils';
import { ServiceWorkerRequest, ServiceWorkerResponse, Status } from '../values';

export default class SearchProgress {
	private readonly url: URL;
	private readonly orderId: string;

	private status: Status = Status.NOT_STARTED;

	private readonly progressBar: HTMLProgressElement;
	private readonly playButton: HTMLButtonElement;
	private readonly pauseButton: HTMLButtonElement;
	private readonly stopButton: HTMLButtonElement;

	private constructor(url: string, orderId: string) {
		this.url = new URL(url);
		this.orderId = orderId;

		this.progressBar = this.createProgressBar();
		this.playButton = this.createPlayButton();
		this.pauseButton = this.createPauseButton();
		this.stopButton = this.createStopButton();

		this.createElement();
		this.startListening();
		this.requestStatus();
		this.requestProgress();
	}

	static builder(url: string, orderId: string): SearchProgress {
		return new this(url, orderId);
	}

	private requestStatus(): void {
		Messages.shoppingCardRequest(this.orderId, ServiceWorkerRequest.STATUS)
			.then(status => this.setStatus(status));
	}

	private setStatus(status: Status): void {
		this.status = status;

		return this.toggleButtonsState();
	}

	private startListening(): void {
		chrome.runtime.onMessage.addListener(({ key, body }: ShoppingCardResponseMessage) => {
			console.log('SearchProgress.class.ts', key, body);

			if (!Utils.isSet(body)) {
				return;
			} else if (body.orderId !== this.orderId) {
				return;
			}

			switch (key) {
				case ServiceWorkerResponse.PROGRESS:
					this.setProgress(body.value);

					break;
			}
		});
	}

	private requestProgress(): void {
		Messages.shoppingCardRequest(this.orderId, ServiceWorkerRequest.PROGRESS)
			.then(progress => this.setProgress(progress));
	}

	private setProgress(progress: number): void {
		this.progressBar.setAttribute('value', progress.toString());
		this.progressBar.textContent = `${progress}%`;
	}

	private toggleButtonsState(): void {
		switch (this.status) {
			case Status.NOT_STARTED:
				this.playButton.disabled = false;
				this.pauseButton.disabled = true;
				this.stopButton.disabled = true;

				break;
			case Status.STARTED:
				this.playButton.disabled = true;
				this.pauseButton.disabled = false;
				this.stopButton.disabled = false;

				break;
			case Status.PAUSED:
				this.playButton.disabled = false;
				this.pauseButton.disabled = true;
				this.stopButton.disabled = false;

				break;
			case Status.STOPPED:
			case Status.FINISHED:
				this.playButton.disabled = false;
				this.pauseButton.disabled = true;
				this.stopButton.disabled = true;
		}
	}

	private createElement(): void {
		const el = document.createElement('article')

		el.setAttribute('id', this.orderId);
		el.classList.add('progress');
		el.append(
			this.progressBar,
			this.createActions()
		);

		const root = document.querySelector('.fjs-parent') as HTMLDivElement;
		root.append(el);
	}

	private createProgressBar(): HTMLProgressElement {
		const el = document.createElement('progress');

		el.setAttribute('value', '0');
		el.setAttribute('max', '100');
		el.textContent = '0%';

		return el;
	}

	private createActions(): HTMLDivElement {
		const el = document.createElement('div');

		el.classList.add('actions');
		el.append(
			this.playButton,
			this.pauseButton,
			this.stopButton
		);

		return el;
	}

	private createPlayButton(): HTMLButtonElement {
		const el = this.createButton('play_arrow');

		el.addEventListener('click', () => {
			return this.play();
		});

		return el;
	}

	private createPauseButton(): HTMLButtonElement {
		const el = this.createButton('pause');

		el.addEventListener('click', () => {
			return this.pause();
		});

		return el;
	}

	private createStopButton(): HTMLButtonElement {
		const el = this.createButton('stop');

		el.addEventListener('click', () => {
			return this.stop();
		});

		return el;
	}

	private createButton(icon: string): HTMLButtonElement {
		const el = document.createElement('button');

		el.setAttribute('type', 'button');
		el.setAttribute('disabled', 'disabled');
		el.append(this.createIcon(icon));

		return el;
	}

	private createIcon(icon: string): HTMLSpanElement {
		const el = document.createElement('span');

		el.classList.add('material-icons');
		el.textContent = icon;

		return el;
	}

	private play(): Promise<void> {
		if (this.status === Status.PAUSED) {
			return Messages.shoppingCardRequest(this.orderId, ServiceWorkerRequest.RESUME)
				.then(status => this.setStatus(status));
		}

		const catalogId = this.url.searchParams.get('catalogId');
		const storeId = this.url.searchParams.get('storeId');
		const langId = this.url.searchParams.get('langId');

		if (!Utils.isSet(catalogId) || !Utils.isSet(storeId) || !Utils.isSet(langId)) {
			return Promise.resolve();
		}

		return Messages.shoppingCardRequest<SearchParams>(this.orderId, ServiceWorkerRequest.PLAY, {
			url: this.url.toString(),
			catalogId,
			storeId,
			langId
		}).then(status => this.setStatus(status));
	}

	private pause(): Promise<void> {
		return Messages.shoppingCardRequest(this.orderId, ServiceWorkerRequest.PAUSE)
			.then(status => this.setStatus(status));
	}

	private stop(): Promise<void> {
		return Messages.shoppingCardRequest(this.orderId, ServiceWorkerRequest.STOP)
			.then(status => this.setStatus(status));
	}
}
