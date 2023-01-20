const storageKey = 'sfmWhySF';

function init(setupTabUl){
    if (setupTabUl){
        let rows = [];
        chrome.storage.sync.get([storageKey], function(items) {
            let rowObj = items[storageKey];

            if (!rowObj) { //Did not find data inside chrome storage
                rowObj = initTabs();
            }

            for (const rowId in rowObj) {
                let row = rowObj[rowId];
                rows.push(generateRowTemplate(row.tabTitle,row.url))
            }
            setupTabUl.insertAdjacentHTML('beforeend', rows.join(''));
        });
        
    }

}

function delayLoadSetupTabs(count) {
    const setupTabUl  = document.getElementsByClassName("tabBarItems slds-grid")[0];
    count++;

    if (count > 5){
        console.log('Why Salesforce - failed to find setup tab.');
        return;
    }

    if (!setupTabUl) {
        setTimeout(function() { delayLoadSetupTabs(0); }, 3000);
    } else {
        init(setupTabUl);
    }
}

setTimeout(function() { delayLoadSetupTabs(0); }, 3000);


function generateRowTemplate(tabTitle, url){
    return `<li role="presentation" style="" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight  navexConsoleTabItem" data-aura-class="navexConsoleTabItem">
                <a role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" class="tabHeader slds-context-bar__label-action " >
                    <span class="title slds-truncate" >${tabTitle}</span>
                </a>
            </li>`
}

function initTabs(){
    let tabs = [
        {tabTitle : 'Flow', url: '/lightning/setup/Flows/home'},
        {tabTitle : 'User', url: '/lightning/setup/ManageUsers/home'}
    ]

    chrome.storage.sync.set({storageKey: tabs}, function() {
        //TODO combine with popup.js with background service
    });

    return tabs;
}