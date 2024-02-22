const isChrome = navigator.userAgent.includes("Chrome");
const browserObj = isChrome ? chrome : browser;
const whyKey = 'sfmWhySF';

function addKey(items, callback){
    items.key = whyKey; 
    callback(items);
}

async function getStorage(callback){
    browserObj.storage.sync.get([whyKey], items => {
        addKey(items, callback);
    });
}

function setStorage(tabs, callback){
    const set = {};
    set[whyKey] = tabs;
    browserObj.storage.sync.set(set, function() {
        //TODO notify user of save
        console.log("saved",set);
        callback(null);
    });
}

// need to use message in order to work in private windows
browserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const message = request.message;
    if(message == null || message.what == null){
        console.error(`invalid message: ${message}`);
        sendResponse(null);
        return false;
    }
    if(message.what === "get"){
        getStorage(sendResponse);
    }
    else if(message.what === "set"){
        setStorage(message.tabs, sendResponse);
    }
    return true;// will call sendResponse asynchronously
});
