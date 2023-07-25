//if error screen, go back
if (window.location.href == "https://www.red9.ethz.ch/errdocs/error_000.html") {
    var oldURL = document.referrer;
    //only go back if vvz or vorlesungen
    if (oldURL.includes("vvz.ethz.ch") || oldURL.includes("vorlesungen.ethz.ch")) {
        await new Promise(r => setTimeout(r, 1500));
        window.history.back();
    }
}