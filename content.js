const storageKey = "sfmWhySF";

function init(setupTabUl) {
    if (setupTabUl) {
        let rows = [];
        browser.storage.sync.get([storageKey], function (items) {
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
        console.error("Why Salesforce - failed to find setup tab.");
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

    browser.storage.sync.set({ sfmWhySF: tabs }, function () {
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

// Listen for messages from the popup (using browser namespace)
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Check if the message contains the action and the necessary tabs data
    if (message.action === "refresh_tabs" && Array.isArray(message.tabs)) {
        refreshTabs(message.tabs); // Pass the received tabs data
        // Firefox uses Promises for sendResponse, unlike Chrome's callback approach
        // Return a Promise that resolves to the response object
        return Promise.resolve({ success: true });
    } else if (message.action === "refresh_tabs") {
        // Handle cases where tabs data might be missing (optional logging)
        console.warn("Received refresh_tabs message but missing tabs data.");
        return Promise.resolve({ success: false, error: "Missing tabs data" });
    }
    // If the message is not handled, return undefined or false (or don't return anything)
    // For async operations not handled here, you might need to return true in Chrome,
    // but Firefox handles async responses differently with Promises.
    // Returning true explicitly is usually not needed unless specifically required by the context.
});

// Function to refresh tabs without page reload, using provided data
function refreshTabs(tabsData) {
    const setupTabUl = document.getElementsByClassName(
        "tabBarItems slds-grid"
    )[0];

    if (setupTabUl) {
        // Remove all existing custom tabs
        const customTabs = setupTabUl.querySelectorAll(
            'li[data-aura-class="navexConsoleTabItem"]'
        );
        customTabs.forEach((tab) => tab.remove());

        // Generate and append new tab elements from the received data
        let rows = [];
        for (const tab of tabsData) {
            rows.push(
                generateRowTemplate(tab.tabTitle, tab.url, tab.openInNewTab)
            );
        }
        setupTabUl.insertAdjacentHTML("beforeend", rows.join(""));

        // Re-add click listeners for the new tabs
        addClickEventListeners(tabsData);
    } else {
        console.warn("Could not find setupTabUl element to refresh tabs.");
    }
}
