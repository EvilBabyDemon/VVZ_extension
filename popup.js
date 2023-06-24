var browser;
if (navigator.userAgent.includes("Firefox")) {
    browser = browser;
} else {
    browser = chrome;
}
var extra = ["hovercourse", "hoverlearnmat", "hovergroups", "hoverrestrict", "hoveroffered"];
var checks = ["all", "crlinks", "rating", "timetable", "autofill", "filter", "hover", "hovercatdata", "hoverperform"];
checks = checks.concat(extra);

// Function to handle toggle change event
async function handleToggleChange(event) {
    var storage = event.target.id;
    var all = storage == "all";
    var toggle = document.getElementById(storage).checked;

    var cooki = await browser.cookies.get({
        url: "https://www.vvz.ethz.ch",
        name: "popupExt"
    });
    var cookieMap;
    if (cooki != null) {
        cookieMap = new Map(JSON.parse(cooki.value))
    } else {
        cookieMap = setInitCookie(checks);
    }
    cookieMap.set(storage, toggle);

    setCookie(cookieMap);

    if (all) {
        for (storage of checks.slice(1)) {
            document.getElementById(storage).disabled = !toggle;
        }
    }
}

function setCookie(cookieMap) {
    browser.cookies.set({
        url: "https://www.vvz.ethz.ch",
        name: "popupExt",
        value: JSON.stringify(Array.from(cookieMap.entries())),
        expirationDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365)
    });
    browser.cookies.set({
        url: "https://www.vorlesungen.ethz.ch",
        name: "popupExt",
        value: JSON.stringify(Array.from(cookieMap.entries())),
        expirationDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365)
    });
}

function setInitCookie() {
    var cookieMap = new Map();
    for (id of checks) {
        if (extra.includes(id)) {
            cookieMap.set(id, false);
        } else {
            cookieMap.set(id, true);
        }
    }

    setCookie(cookieMap);

    return cookieMap;
}
async function main() {

    var cooki = await browser.cookies.get({
        url: "https://www.vvz.ethz.ch",
        name: "popupExt"
    });
    var cookieMap;
    if (cooki != null) {
        cookieMap = new Map(JSON.parse(cooki.value))
    } else {
        cookieMap = setInitCookie();
    }

    for (id of checks) {
        document.getElementById(id).checked = cookieMap.get(id);
        document.getElementById(id).addEventListener('change', handleToggleChange);
    }
    if (!cookieMap.get(checks[0])) {
        for (storage of checks.slice(1)) {
            document.getElementById(storage).disabled = true;
        }
    }
}

main();