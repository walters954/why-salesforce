const isChrome = navigator.userAgent.includes("Chrome");
const browserObj = isChrome ? chrome : browser;
const whyKey = "againWhySalesforce";

function addKey(items, callback) {
	items.key = whyKey;
	callback(items);
}

function getStorage(callback) {
	browserObj.storage.sync.get([whyKey], (items) => {
		addKey(items, callback);
	});
}

function setStorage(tabs, callback) {
	const set = {};
	set[whyKey] = tabs;
	browserObj.storage.sync.set(set, () => callback(null));
}

// need to use message in order to work in private windows
browserObj.runtime.onMessage.addListener((request, _, sendResponse) => {
	const message = request.message;
	if (message == null || message.what == null) {
		console.error({ error: "Invalid message", message, request });
		sendResponse(null);
		return false;
	}
	let captured = false;
	if (message.what === "get") {
		getStorage(sendResponse);
		captured = true;
	} else if (message.what === "set") {
		setStorage(message.tabs, sendResponse);
		captured = true;
	} else if (message.what === "saved" || message.what === "add") {
		const notify = (count = 0) => {
			browserObj.tabs.query(
				{ active: true, currentWindow: true },
				function (tabs) {
					if (tabs && tabs[0]) {
						browserObj.tabs.sendMessage(tabs[0].id, message);
					} //browserObj.tabs.sendMessage({}, message);
					else if (count < 5) {
						setTimeout(() => notify(count + 1), 500);
					}
				},
			);
		};
		notify();
		sendResponse(null);
		return false; // we won't call sendResponse
	}
	captured = captured || ["import", "saved", "add"].includes(message.what);
	if (!captured) {
		console.error({ "error": "Unknown message", message, request });
	}

	return captured; // will call sendResponse asynchronously if true
});
