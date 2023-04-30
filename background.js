chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    var cookieMap;
    var cooki = await chrome.cookies.get({
        url: "https://" + message.data,
        name: "popupExt"
    });
    if (cooki != null) {
        cookieMap = new Map(JSON.parse(cooki.value))
    }
    return cookieMap;
});
