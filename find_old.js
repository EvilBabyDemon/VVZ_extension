async function showOldOccurences() {
    var ctop = document.getElementById("contentTop");
    var h1s = ctop.getElementsByTagName("h1");
    if (h1s.length > 0) {
        var h1 = h1s[0];
        var courseNumber = h1.textContent.split(" ")[0].trim();
        var currSem = window.location.href.match(/semkez\=(\d+[WS])/)[1];
        // get time add 1 month
        // if month < 5
        // search with year + FS and then go down
        // else year + HS and then go down
        // 2HS -> 2FS -> 1HS -> 1FS x

        //add 1 month this way in december it should include the new semester if it is already out.
        var time = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
        var year = time.getUTCFullYear();
        var month = time.getUTCMonth();

        var season;

        // month before May
        if (month < 4) {
            season = "S";
        } else {
            season = "W";
        }
        var url = window.location.href.match(/https:\/\/www\..*\.ethz\.ch/)[0];
        var end = document.createElement("div");
        document.getElementById("contentContainer").appendChild(end);
        
        var start_timeout = 200;
        var max_timeout = start_timeout * 2 ** 6; // try 6 times (with backoff of more than 10 seconds)
        var timeout = start_timeout;
        // go back 14 semester, max amount they show atm (could be the possibility that the new semestesr is not out yet and therefor the oldest available one wont be checked/shown though)
        for (var i = 0; i < 12; i++) {
            var sem = year + season;
            console.log(i + " " + sem);
            //change semester
            if (season == "W") {
                season = "S";
            } else {
                year -= 1;
                season = "W";
            }
            if (sem == currSem) {
                continue;
            }

            let unitReq = await fetch(`${url}/sucheLehrangebot.view?semkez=${sem}&lerneinheitscode=${courseNumber}`);
            let unitHTML = await unitReq.text();
            const dom = new DOMParser().parseFromString(unitHTML.replace(/&nbsp;/g, " "), "text/html");

            if (dom.getElementsByClassName("error").length > 0) {
                await new Promise(r => setTimeout(r, timeout));
                i -= 1;
                timeout *= 2;
                if (timeout > max_timeout) {
                    i += 1;
                    timeout = start_timeout;
                }
                continue;
            }

            var link = unitHTML.match(/lerneinheit\.view\?lerneinheitId\=\d+&semkez\=/);
            if (link != null) {
                var a = document.createElement("a");
                a.href = link[0] + sem;
                a.textContent = sem + " ";
                end.appendChild(a);
            }
            await new Promise(r => setTimeout(r, 200));
        }
    }
}