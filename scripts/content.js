function init(setupTabUl){
    if (setupTabUl){
        let rows = [];
        chrome.storage.sync.get(['sfmWhySF'], function(items) {
            console.log('Settings retrieved', items);
            const rowObj = items['sfmWhySF'];
            for (const rowId in rowObj) {
                console.log(`${rowId}: ${rowObj[rowId]}`);
                let row = rowObj[rowId];
                rows.push(generateRowTemplate(row.tabTitle,row.url))
            }

            console.log(rows);
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