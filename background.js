chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
    chrome.cookies.get({
        url: "https://" + request,
        name: "popupExt"
    }, function (cookies) {
        sendResponse(cookies);
    });
    return true; 
}
