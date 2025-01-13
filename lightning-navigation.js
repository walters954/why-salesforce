// Listener for custom events from the content script
function doLightningNavigation(details) {
	try {
		switch (details.navigationType) {
			case "recordId": {
				const recordEvent = $A.get("e.force:navigateToSObject");
				recordEvent.setParams({ recordId: details.recordId });
				recordEvent.fire();
				break;
			}
			case "url": {
				const urlEvent = $A.get("e.force:navigateToURL");
				urlEvent.setParams({ url: details.url });
				urlEvent.fire();
				break;
			}
			default: {
				console.error("Invalid navigation type");
			}
		}
	} catch (error) {
		console.error(`Navigation failed: ${error.message}`);
		if (details.fallbackURL) {
			open(details.fallbackURL, "_top");
		}
	}
}

// listen to possible updates from tableDragHandler
addEventListener("message", (e) => {
	if (e.source != window) {
		return;
	}
	const what = e.data.what;
	if (what === "lightningNavigation") {
		doLightningNavigation(e.data);
	}
});
