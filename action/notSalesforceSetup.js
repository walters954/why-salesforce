// deno-lint-ignore-file no-window
const page = new URLSearchParams(window.location.search).get("url");
const textEl = document.querySelector("h3");

const div = document.createElement("div");
const prefix = document.createTextNode("This is not a ")
const strongEl = document.createElement("strong")
const otherText = document.createTextNode();

if (page != null) { // we're in a salesforce page
	// switch which button is shown
	document.getElementById("login").classList.add("hidden");
	const goSetup = document.getElementById("go-setup");
	goSetup.classList.remove("hidden");
	// update the button href to use the domain
	const domain = page.substring(0, page.indexOf("/lightning"));
	goSetup.href = `${domain}/lightning/setup/SetupOneHome/home`;
	// update the bold on the text
    otherText = "Salesforce Lightning";
    strongEl = "Setup Page"
} else {
    strongEl = "Salesforce Lightning";
    otherText = "Setup Page";
}
textEl.innerText = "";
textEl.insertAdjacentHTML("beforeend", text);
