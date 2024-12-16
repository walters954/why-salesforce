// deno-lint-ignore-file no-window
const page = new URLSearchParams(window.location.search).get("url");
const textEl = document.querySelector("h3");
let text;
if (page != null) { // we're in a salesforce page
	// switch which button is shown
	document.getElementById("login").classList.add("hidden");
	const goSetup = document.getElementById("go-setup");
	goSetup.classList.remove("hidden");
	// update the button href to use the domain
	const goSetupLink = goSetup.querySelector("a");
	const domain = page.substring(0, page.indexOf("/lightning"));
	goSetupLink.href = `${domain}/lightning/setup/SetupOneHome/home`;
	// update the bold on the text
	text = "This is not a Salesforce Lightning <strong>Setup Page</strong>";
} else {
	text = "This is not a <strong>Salesforce Lightning</strong> Setup Page";
}
textEl.innerText = "";
textEl.insertAdjacentHTML("beforeend", text);
