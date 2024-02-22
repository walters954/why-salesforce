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

function generateToastMessage(){
    return `<div id="again-why-salesforce-toast" class="toastContainer slds-notify_container slds-is-relative" data-aura-rendered-by="7381:0"><div role="alertdialog" aria-describedby="toastDescription7382:0" data-key="success" class="slds-theme--success slds-notify--toast slds-notify slds-notify--toast forceToastMessage" data-aura-rendered-by="7384:0" data-aura-class="forceToastMessage" aria-label="Success"><lightning-icon icon-name="utility:success" class="slds-icon-utility-success toastIcon slds-m-right--small slds-no-flex slds-align-top slds-icon_container" data-data-rendering-service-uid="1478" data-aura-rendered-by="7386:0"><span style="--sds-c-icon-color-background: var(--slds-c-icon-color-background, transparent)" part="boundary"><lightning-primitive-icon size="small" variant="inverse"><svg class="slds-icon slds-icon_small" focusable="false" data-key="success" aria-hidden="true" viewBox="0 0 520 520" part="icon"><g><path d="M260 20a240 240 0 100 480 240 240 0 100-480zm134 180L241 355c-6 6-16 6-22 0l-84-85c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l44 45a10 10 0 0015 0l112-116c6-6 16-6 22 0l22 22c7 6 7 16 0 23z"></path></g></svg></lightning-primitive-icon><span class="slds-assistive-text">Success</span></span></lightning-icon><div class="toastContent slds-notify__content" data-aura-rendered-by="7387:0"><div class="slds-align-middle slds-hyphenate" data-aura-rendered-by="7388:0"><!--render facet: 7389:0--><div id="toastDescription7382:0" data-aura-rendered-by="7390:0"><span class="toastMessage slds-text-heading--small forceActionsText" data-aura-rendered-by="7395:0" data-aura-class="forceActionsText">"Again, Why Salesforce" tabs saved.</span></div></div></div><!--render facet: 7398:0--></div></div>`
}

function showToast(){
    const hanger = document.getElementsByClassName("oneConsoleTabset navexConsoleTabset")[0];
    hanger.insertAdjacentHTML("beforeend", generateToastMessage());
    setTimeout(() => {
        hanger.removeChild(document.getElementById("again-why-salesforce-toast"));
    }, 4000);
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
        showToast()
    }
});

delayLoadSetupTabs();
