"use strict";

let setupTabUl;// This is on Salesforce Setup
const setupLightning = "/lightning/setup/";
let href = window.location.href;
const baseUrl = href.slice(0,href.indexOf(setupLightning));
const currentTabs = [];

function sendMessage(message, callback){
    chrome.runtime.sendMessage({message, url: location.href}, callback);
}

function getStorage(callback){
    sendMessage({"what": "get"}, callback);
}

function afterSet(){
    reloadTabs();
    showToast()
}

function setStorage(tabs){
    sendMessage({"what": "set", tabs}, afterSet);
}

function cleanupUrl(url = href, nochange = null){
    const asis = nochange == null ? url.startsWith("http") : nochange;

    if(url.startsWith("/"))
        url = url.slice(1);
    if(url.endsWith("/"))
        url = url.slice(0,url.length-1);
    if(url.includes(setupLightning))
        url = url.slice(url.indexOf(setupLightning)+setupLightning.length);
    
    return asis ? url : `${baseUrl}${setupLightning}${url}`;
}

function generateRowTemplate(row){
    let { tabTitle, url } = row;
    url = cleanupUrl(url);

    return `<li role="presentation" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem why-salesforce" data-aura-class="navexConsoleTabItem">
                <a data-draggable="true" role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" class="tabHeader slds-context-bar__label-action" >
                    <span class="title slds-truncate">${tabTitle}</span>
                </a>
            </li>`;
}

function generateSldsToastMessage(){
    return `<div id="why-salesforce-toast" class="toastContainer slds-notify_container slds-is-relative" data-aura-rendered-by="7381:0"><div role="alertdialog" aria-describedby="toastDescription7382:0" data-key="success" class="slds-theme--success slds-notify--toast slds-notify slds-notify--toast forceToastMessage" data-aura-rendered-by="7384:0" data-aura-class="forceToastMessage" aria-label="Success"><lightning-icon icon-name="utility:success" class="slds-icon-utility-success toastIcon slds-m-right--small slds-no-flex slds-align-top slds-icon_container" data-data-rendering-service-uid="1478" data-aura-rendered-by="7386:0"><span style="--sds-c-icon-color-background: var(--slds-c-icon-color-background, transparent)" part="boundary"><lightning-primitive-icon size="small" variant="inverse"><svg class="slds-icon slds-icon_small" focusable="false" data-key="success" aria-hidden="true" viewBox="0 0 520 520" part="icon"><g><path d="M260 20a240 240 0 100 480 240 240 0 100-480zm134 180L241 355c-6 6-16 6-22 0l-84-85c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l44 45a10 10 0 0015 0l112-116c6-6 16-6 22 0l22 22c7 6 7 16 0 23z"></path></g></svg></lightning-primitive-icon><span class="slds-assistive-text">Success</span></span></lightning-icon><div class="toastContent slds-notify__content" data-aura-rendered-by="7387:0"><div class="slds-align-middle slds-hyphenate" data-aura-rendered-by="7388:0"><!--render facet: 7389:0--><div id="toastDescription7382:0" data-aura-rendered-by="7390:0"><span class="toastMessage slds-text-heading--small forceActionsText" data-aura-rendered-by="7395:0" data-aura-class="forceActionsText">"Again, Why Salesforce" tabs saved.</span></div></div></div><!--render facet: 7398:0--></div></div>`;
}

function showToast(){
    const hanger = document.getElementsByClassName("oneConsoleTabset navexConsoleTabset")[0];
    hanger.insertAdjacentHTML("beforeend", generateSldsToastMessage());
    setTimeout(() => {
        hanger.removeChild(document.getElementById("why-salesforce-toast"));
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

function generateFavouriteButton(){
    return `<button aria-live="off" type="button" class="slds-button slds-button--neutral uiButton why-salesforce-button" aria-label="" data-aura-rendered-by="3:829;a" data-aura-class="uiButton"><span dir="ltr" class=" label bBody" data-aura-rendered-by="6:829;a">Favourite this page</span></button>`;
}

function saveFavourite(parent){
    const tabTitle = parent.querySelector(".breadcrumbDetail").innerText;
    const url = cleanupUrl();
    currentTabs.push({tabTitle, url});
    setStorage(currentTabs);
}

function showFavouriteButton(count = 0){
    if (count > 5){
        console.error('Why Salesforce - failed to find headers.');
        return;
    }

    // there's possibly 2 headers: one for Setup home and one for Object Manager
    const headers = Array.from(document.querySelectorAll("div.overflow.uiBlock > div.bRight"));
    if(headers == null || headers.length < 1){
        setTimeout(() => showFavouriteButton(count + 1), 500);
        return;
    }

    for(const header of headers){
        if(header.querySelector(".why-salesforce-button") != null)
            continue;
        header.insertAdjacentHTML("beforeend", generateFavouriteButton());
        const button = header.querySelector(".why-salesforce-button");
        button.addEventListener("click", () => saveFavourite(header.parentNode));
    }
}

function init(items){
    //call inittabs if we did not find data inside storage
    const rowObj = (items == null || items[items.key] == null) ? initTabs() : items[items.key];

    const rows = [];
    for (const row of rowObj) {
        const htmlEl = generateRowTemplate(row);
        const replaceVector = `why-salesforce ${href === cleanupUrl(row.url) ? "slds-is-active" : ""}`;
        rows.push(htmlEl.replace("why-salesforce", replaceVector))
    }
    setupTabUl.insertAdjacentHTML('beforeend', rows.join(''));
    currentTabs.push(...rowObj);
    showFavouriteButton();
}

function delayLoadSetupTabs(count = 0) {
    if (count > 5){
        console.error('Why Salesforce - failed to find setup tab.');
        return;
    }

    setupTabUl = document.getElementsByClassName("tabBarItems slds-grid")[0];
    if(setupTabUl == null){
        setTimeout(() => delayLoadSetupTabs(count + 1), 500);
    } else getStorage(init);
}

function reloadTabs(){
    getStorage(init);
    while(setupTabUl.childElementCount > 3){// hidden li + Home + Object Manager
        setupTabUl.removeChild(setupTabUl.lastChild);
        currentTabs.pop();
    }
}

function generateSldsInput(){
    return `<div id="why-salesforce-import" style="width: 100%;display: flex;align-items: center;justify-content: center;position: fixed;left: 0;"><div style="position: absolute;background-color: lightgoldenrodyellow;top: 2rem;width: 18rem;height: 8rem;display: flex;align-items: center;justify-content: center;text-align: center;border: 1px solid lightskyblue;border-radius: 1rem;flex-direction: column;box-shadow: 1px 2px 3px black"><h4 style="font-weight: revert;font-size: initial;margin-bottom: 0.6rem;">Again, Why Salesforce import</h4><input accept=".json" class="slds-file-selector__input slds-assistive-text" type="file" id="input-file-166" multiple="" name="fileInput" part="input" aria-labelledby="form-label-166 file-selector-label-166"><label class="slds-file-selector__body" id="file-selector-label-166" data-file-selector-label="" for="input-file-166" aria-hidden="true"><span class="slds-file-selector__button slds-button slds-button_neutral" part="button"><lightning-primitive-icon variant="bare"><svg class="slds-button__icon slds-button__icon_left" focusable="false" data-key="upload" aria-hidden="true" viewBox="0 0 520 520" part="icon"><g><path d="M485 310h-30c-8 0-15 8-15 15v100c0 8-7 15-15 15H95c-8 0-15-7-15-15V325c0-7-7-15-15-15H35c-8 0-15 8-15 15v135a40 40 0 0040 40h400a40 40 0 0040-40V325c0-7-7-15-15-15zM270 24c-6-6-15-6-21 0L114 159c-6 6-6 15 0 21l21 21c6 6 15 6 21 0l56-56c6-6 18-2 18 7v212c0 8 6 15 14 15h30c8 0 16-8 16-15V153c0-9 10-13 17-7l56 56c6 6 15 6 21 0l21-21c6-6 6-15 0-21z"></path></g></svg></lightning-primitive-icon>Upload Files</span><span class="slds-file-selector__text slds-medium-show">Or drop files</span></label></div></div>`;
}

function showFileImport(){
    setupTabUl.insertAdjacentHTML("beforeend", generateSldsInput());
}

function importer(message){
    const importedArray = message.imported;
    currentTabs.push(...importedArray);
    // remove file import
    setupTabUl.removeChild(setupTabUl.querySelector("#why-salesforce-import"));
    setStorage(currentTabs);
}

function reorderTabs(){
    // get the list of tabs
    const tabs = [];
    Array.from(setupTabUl.children).slice(3).forEach(tab => {
        const tabTitle = tab.querySelector("a > span").innerText;
        const url = cleanupUrl(tab.querySelector("a").href, true);
        if (tabTitle && url){
            tabs.push({tabTitle, url});
        }
    });
    setStorage(tabs);
}

// listen for href change to update the tabs does not work with popstate or hashchange
// either we poll every so ofter or we listen to click in the setup link list, in the object list, in the object settings, ...
setInterval(() => {
    const newRef = window.location.href;
    if(newRef === href)
        return;
    href = newRef;
    reloadTabs();
}, 10000);// 10s should not bother too much and still be reactive enough

// listen from saves from the action page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message == null || message.what == null)
        return;
    if(message.what === "saved") {
        sendResponse(null);
        afterSet();
    }
    else if(message.what === "add"){
        sendResponse(null);
        showFileImport();
    }
});

// listen to possible updates from tableDragHandler
window.addEventListener("message", e => {
    if (e.source != window) {
        return;
    }
    const what = e.data.what;
    if(what === "order")
        reorderTabs();
    else if(what === "import")
        importer(e.data);
});

delayLoadSetupTabs();
