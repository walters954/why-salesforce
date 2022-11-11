function init(setupTabUl){
    if (setupTabUl){
        //TODO if select active the tabs and deactivate other tabs
        //TODO make in popup menu
        let flowSetupTabHTML = `
        <li role="presentation" style="" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight  navexConsoleTabItem" data-aura-class="navexConsoleTabItem">
            <a role="tab" tabindex="-1" title="Flow" aria-selected="false" href="/lightning/setup/Flows/home" class="tabHeader slds-context-bar__label-action " >
                <span class="title slds-truncate" >Flow</span>
            </a>
        </li>
        <li role="presentation" style="" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight  navexConsoleTabItem" data-aura-class="navexConsoleTabItem">
            <a role="tab" tabindex="-1" title="User" aria-selected="false" href="/lightning/setup/ManageUsers/home" class="tabHeader slds-context-bar__label-action " >
                <span class="title slds-truncate" >User</span>
            </a>
        </li>
        `;
        setupTabUl.insertAdjacentHTML('beforeend', flowSetupTabHTML);
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

