var browser;
if (navigator.userAgent.includes("Firefox")) {
    browser = browser;
} else {
    browser = chrome;
}

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
    browser.cookies.get({
        url: "https://" + request,
        name: "popupExt"
    }, function (cookies) {
        sendResponse(cookies);
    });
    return true; 
}
