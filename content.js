"use strict";

let whyKey;
let setupTabUl = document.getElementsByClassName("tabBarItems slds-grid")[0];//This is on Salesforce Setup
const setupLightning = "/lightning/setup/";
const setupDefaultPage = "/home";

function sendMessage(message, callback){
    chrome.runtime.sendMessage({message, url: location.href}, callback);
}

function getStorage(callback){
    sendMessage({"what": "get"}, callback);
}

function setStorage(tabs){
    sendMessage({"what": "set", tabs}, null);
}

function setWhyKey(value){
    whyKey = value;
}

function getWhyKey(){
    sendMessage({"what": "getKey"}, setWhyKey);
}

function generateRowTemplate(row){
    let { tabTitle, url } = row;
    if(url.startsWith("/"))
        url = url.slice(1);
    if(url.endsWith("/"))
        url = url.slice(0,url.length-1);
    url = `${setupLightning}${url}${setupDefaultPage}`;

    return `<li role="presentation" style="" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem" data-aura-class="navexConsoleTabItem">
                <a role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" class="tabHeader slds-context-bar__label-action" >
                    <span class="title slds-truncate">${tabTitle}</span>
                </a>
            </li>`
}

function initTabs(){
    const tabs = [
        {tabTitle : 'Flows', url: 'Flows'},
        {tabTitle : 'Users', url: 'ManageUsers'}
    ]
    setStorage(tabs);
    return tabs;
}

function init(items){
    console.log(items, whyKey);
    //call inittabs if we did not find data inside storage
    const rowObj = (items == null || items[whyKey] == null) ? initTabs() : items[whyKey];

    const rows = [];
    for (const row of rowObj) {
        rows.push(generateRowTemplate(row))
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

getWhyKey();
delayLoadSetupTabs();
