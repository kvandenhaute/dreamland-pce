import Utils from './utils';

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
		.then(tab => Utils.typeFilter(tab));

	if (tabs.length === 0) {
		throw new Error('No active tab');
	}

	return tabs[ 0 ];
}

export default {
	current: getCurrentTab
};
