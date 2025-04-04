const storageKey = "sfmWhySF";

{
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("lightning-navigation.js");
	(document.head || document.documentElement).appendChild(script);
}

function init(setupTabUl) {
    if (setupTabUl) {
        chrome.storage.sync.get([storageKey], function (items) {
            let rowObj = items[storageKey] || [];
            if (rowObj.length === 0) {
                //Did not find data inside browser storage
                rowObj = initTabs();
            }

            for (const rowId in rowObj) {
                let row = rowObj[rowId];
                setupTabUl.appendChild(
                    generateRowTemplate(row.tabTitle, row.url, row.openInNewTab)
                );
            }
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
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    li.className = 'oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem';
    li.setAttribute('data-aura-class', 'navexConsoleTabItem');
    li.setAttribute('data-url', url);

    const target = openInNewTab ? "_blank" : "_self";
    const a = document.createElement('a');
    a.setAttribute('role', 'tab');
    a.setAttribute('tabindex', '-1');
    a.setAttribute('title', tabTitle);
    a.setAttribute('aria-selected', 'false');
    a.setAttribute('href', url);
    a.setAttribute('target', target);
    a.classList.add('tabHeader','slds-context-bar__label-action');
    // add click event listener on creation
    a.addEventListener("click", handleLightningLinkClick);

    const span = document.createElement('span');
    span.classList.add('title','slds-truncate');
    span.textContent = tabTitle;

    a.appendChild(span);
    li.appendChild(a);
    return li;
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

/**
 * Handles the redirection to another Salesforce page without requiring a full reload.
 *
 * @param {Event} e - the click event
 */
function handleLightningLinkClick(e) {
	e.preventDefault(); // Prevent the default link behavior (href navigation)
	const url = e.currentTarget.href;
	const target = e.currentTarget.target;
	if (target === "_blank") {
		open(url, target);
	} else {
		postMessage({
			what: "lightningNavigation",
			navigationType: "url",
			url,
			fallbackURL: url,
		}, "*");
	}
}
