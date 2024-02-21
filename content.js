"use strict";
//const { getStorage, setStorage } = require("./popup");
//import { getStorage, setStorage } from "./popup";

const whyKey = 'sfmWhySF';
const setupTabUl  = document.getElementsByClassName("tabBarItems slds-grid")[0];

function getStorage(callback){
    chrome.storage.sync.get([whyKey], function(items) {
        console.log(`get ${items}`);
        callback(items);
    });
}

function setStorage(tabs){
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({whyKey: tabs}, function() {
        //TODO notify user of save
        console.log("saved");
    });
}

function generateRowTemplate(tabTitle, url){
    return `<li role="presentation" style="" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem" data-aura-class="navexConsoleTabItem">
                <a role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" class="tabHeader slds-context-bar__label-action" >
                    <span class="title slds-truncate">${tabTitle}</span>
                </a>
            </li>`
}

function initTabs(){
    const tabs = [
        {tabTitle : 'Flows', url: '/lightning/setup/Flows/home'},
        {tabTitle : 'Users', url: '/lightning/setup/ManageUsers/home'}
    ]
    setStorage(tabs);
    return tabs;
}

function _init(items){
    //call inittabs if we did not find data inside storage
    const rowObj = (items == null || items[whyKey] == null) ? initTabs() : items[whyKey];

    const rows = [];
    for (const row of rowObj) {
        rows.push(generateRowTemplate(row.tabTitle,row.url))
    }
    setupTabUl.insertAdjacentHTML('beforeend', rows.join(''));
}

function init(setupTabUl){
    if (setupTabUl == null)
        return;
    getStorage(_init);
}

function delayLoadSetupTabs(count = 0) {

    if (count > 5){
        console.log('Why Salesforce - failed to find setup tab.');
        return;
    }

    setupTabUl == null ? setTimeout(function() { delayLoadSetupTabs(count++); }, 500) : init(setupTabUl);
}

setTimeout(function() { delayLoadSetupTabs(0); }, 3000);
