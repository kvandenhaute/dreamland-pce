const orderId = document.getElementById('orderId') as HTMLInputElement | null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	sendResponse(orderId && orderId.value);
});
