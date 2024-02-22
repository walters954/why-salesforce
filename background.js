const isChrome = navigator.userAgent.includes("Chrome");
const whyKey = 'sfmWhySF';

async function getStorage(callback){
    console.log({isChrome});
    if(isChrome)
        return chrome.storage.sync.get([whyKey], callback);//chrome
    //firefox
    const result = await browser.storage.sync.get([whyKey]);
    callback(await result);
}

function setStorage(tabs){
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({whyKey: tabs}, function() {
        //TODO notify user of save
        console.log("saved");
    });
}

// need to use message in order to work in private windows
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const message = request.message;
    if(message.what === "get")
        return getStorage(sendResponse);
    if(message.what === "set")
        return setStorage(message.tabs);
    if(message.what === "getKey")
        return sendResponse(whyKey)
    console.error(`invalid message: ${message}`);
});
