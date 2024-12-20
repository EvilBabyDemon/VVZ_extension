async function on_error() {
    //if error screen, go back
    if (window.location.href == "https://www.red9.ethz.ch/errdocs/error_000.html") {
        var oldURL = document.referrer;
        //only go back if vvz or vorlesungen
        if (oldURL.includes("vvz.ethz.ch") || oldURL.includes("vorlesungen.ethz.ch")) {
            //save errortime as [errorTime: amount of consecutive errors]
            //consecutive errors being each less than x seconds from the last error
            //check localstorage for last error time
            var errorTime = new Date().getTime();
            var lastErrorTime = localStorage.getItem("lastErrorTime");
            var consecutiveErrors = 1;
            if (lastErrorTime) {
                [lastErrorTime, consecutiveErrors] = lastErrorTime.split(",");
                //last error was less than 15 seconds ago
                if (errorTime - lastErrorTime < 1000 * 15) {
                    consecutiveErrors++;
                } else {
                    consecutiveErrors = 1;
                }
            }
            localStorage.setItem("lastErrorTime", errorTime + "," + consecutiveErrors);
            var timeout = 1000 * consecutiveErrors;
            await new Promise(r => setTimeout(r, timeout));
            window.history.back();
        }
    }
}
on_error();