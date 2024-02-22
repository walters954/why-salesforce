"use strict";

let setupTabUl = document.getElementsByClassName("tabBarItems slds-grid")[0];//This is on Salesforce Setup
const setupLightning = "/lightning/setup/";
const setupDefaultPage = "/home";
const href = window.location.href;
const baseUrl = href.slice(0,href.indexOf(setupLightning));

function sendMessage(message, callback){
    chrome.runtime.sendMessage({message, url: location.href}, callback);
}

function getStorage(callback){
    sendMessage({"what": "get"}, callback);
}

function setStorage(tabs){
    sendMessage({"what": "set", tabs}, null);
}

function cleanupUrl(url){
    if(url.startsWith("/"))
        url = url.slice(1);
    if(url.endsWith("/"))
        url = url.slice(0,url.length-1);
    if(url.includes(setupLightning))
        url = url.slice(url.indexOf(setupLightning)+setupLightning.length);
    if(url.includes(setupDefaultPage))
        url = url.slice(0,url.indexOf(setupDefaultPage));
    
    url = `${baseUrl}${setupLightning}${url}${setupDefaultPage}`;
    return url;
}

function generateRowTemplate(row){
    let { tabTitle, url } = row;
    url = cleanupUrl(url);

    return `<li role="presentation" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem again-why-salesforce" data-aura-class="navexConsoleTabItem">
                <a role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" class="tabHeader slds-context-bar__label-action" >
                    <span class="title slds-truncate">${tabTitle}</span>
                </a>
            </li>`
}

function initTabs(){
    const tabs = [
        {tabTitle : 'Flows', url: 'Flows/home'},
        {tabTitle : 'Users', url: 'ManageUsers/home'}
    ]
    setStorage(tabs);
    return tabs;
}

function init(items){
    //call inittabs if we did not find data inside storage
    const rowObj = (items == null || items[items.key] == null) ? initTabs() : items[items.key];

    const rows = [];
    for (const row of rowObj) {
        const htmlEl = generateRowTemplate(row);
        const replaceVector = `again-why-salesforce ${href === cleanupUrl(row.url) ? "slds-is-active" : ""}`;
        rows.push(htmlEl.replace("again-why-salesforce", replaceVector))
    }
    setupTabUl.insertAdjacentHTML('beforeend', rows.join(''));
}

function delayLoadSetupTabs(count = 0) {
    if (count > 5){
        console.error('Why Salesforce - failed to find setup tab.');
        return;
    }

    if(setupTabUl == null){
        setupTabUl = document.getElementsByClassName("tabBarItems slds-grid")[0];
        setTimeout(function() { delayLoadSetupTabs(count + 1); }, 500);
    } else getStorage(init);
}

function reloadTabs(){
    getStorage(init);
    while(setupTabUl.childElementCount > 3){// hidden li + Home + Object Manager
        setupTabUl.removeChild(setupTabUl.lastChild);
    }
}

// listen from saves from the action page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message != null && message.what === "saved") {
        sendResponse(null);
        reloadTabs();
    }
});

delayLoadSetupTabs();
