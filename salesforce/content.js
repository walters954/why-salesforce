"use strict";
//const { getStorage, setStorage } = require("./popup");
//import { getStorage, setStorage } from "./popup";

const whyKey = 'sfmWhySF';
let setupTabUl = document.getElementsByClassName("tabBarItems slds-grid")[0];
const setupLightning = "/lightning/setup/";

function getStorage(callback){
    chrome.storage.sync.get([whyKey], function(items) {
        callback(items);
    });
}

function setStorage(tabs){
    console.log({tabs});
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({whyKey: tabs}, function() {
        //TODO notify user of save
        console.log("saved");
    });
}

function generateRowTemplate(row){
    let { tabTitle, url } = row;
    if(url.startsWith("/"))
        url = url.slice(1);
    if(url.endsWith("/"))
        url = url.slice(0,url.length-1);
    url = `${setupLightning}${url}`;

    return `<li role="presentation" style="" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem" data-aura-class="navexConsoleTabItem">
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
    console.log({items});
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
console.log({count});
    if(setupTabUl == null){
        setupTabUl = document.getElementsByClassName("tabBarItems slds-grid")[0];
        setTimeout(function() { delayLoadSetupTabs(count + 1); }, 500);
    } else getStorage(init);
}

delayLoadSetupTabs();
