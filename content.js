const storageKey = "sfmWhySF";

function init(setupTabUl) {
    if (setupTabUl) {
        let rows = [];
        chrome.storage.sync.get([storageKey], function (items) {
            let rowObj = items[storageKey] || [];
            if (rowObj.length === 0) {
                //Did not find data inside browser storage
                rowObj = initTabs();
            }

            for (const rowId in rowObj) {
                let row = rowObj[rowId];
                rows.push(
                    generateRowTemplate(row.tabTitle, row.url, row.openInNewTab)
                );
            }
            setupTabUl.insertAdjacentHTML("beforeend", rows.join(""));

            // Add click event listeners after rows are inserted
            addClickEventListeners(rowObj);
        });
    }
}

function delayLoadSetupTabs(count) {
    const setupTabUl = document.getElementsByClassName(
        "tabBarItems slds-grid"
    )[0];
    count++;

    if (count > 5) {
        console.log("Why Salesforce - failed to find setup tab.");
        return;
    }

    if (!setupTabUl) {
        setTimeout(function () {
            delayLoadSetupTabs(count);
        }, 3000); // Fixed to pass count correctly
    } else {
        init(setupTabUl);
    }
}

setTimeout(function () {
    delayLoadSetupTabs(0);
}, 3000);

function generateRowTemplate(tabTitle, url, openInNewTab) {
    const target = openInNewTab ? "_blank" : "_self";
    return `<li role="presentation" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem" data-aura-class="navexConsoleTabItem" data-url="${url}">
            <a role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" target="${target}" class="tabHeader slds-context-bar__label-action">
                <span class="title slds-truncate">${tabTitle}</span>
            </a>
        </li>`;
}

function initTabs() {
    let tabs = [
        { tabTitle: "Home", url: "/", openInNewTab: false },
        {
            tabTitle: "Flow",
            url: "/lightning/setup/Flows/home",
            openInNewTab: true,
        },
        {
            tabTitle: "User",
            url: "/lightning/setup/ManageUsers/home",
            openInNewTab: false,
        },
    ];

    chrome.storage.sync.set({ sfmWhySF: tabs }, function () {
        //TODO combine with popup.js with background service
    });
    return tabs;
}

function addClickEventListeners(tabs) {
    for (const rowId in tabs) {
        let tab = tabs[rowId];
        document.querySelectorAll(`a[href="${tab.url}"]`).forEach((link) => {
            link.addEventListener("click", function (event) {
                if (tab.openInNewTab) {
                    event.preventDefault();
                    window.open(tab.url, "_blank");
                }
            });
        });
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "refresh_tabs") {
        refreshTabs();
        sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async response
});

// Function to refresh tabs without page reload
function refreshTabs() {
    const setupTabUl = document.getElementsByClassName(
        "tabBarItems slds-grid"
    )[0];

    if (setupTabUl) {
        // Remove all custom tabs (identify them by data-aura-class="navexConsoleTabItem")
        const customTabs = setupTabUl.querySelectorAll(
            'li[data-aura-class="navexConsoleTabItem"]'
        );
        customTabs.forEach((tab) => tab.remove());

        // Re-initialize tabs
        init(setupTabUl);
    }
}
