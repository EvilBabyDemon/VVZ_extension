var browser;
if (navigator.userAgent.includes("Firefox")) {
    browser = browser;
} else {
    browser = chrome;
}

getCookie();
function getCookie() {
    browser.runtime.sendMessage(window.location.hostname, function (response) {
        var cookieMap;
        if (response != null) {
            cookieMap = new Map(JSON.parse(response.value));
        }
        main(cookieMap);
    });
}
async function reload() {
    await new Promise(r => setTimeout(r, 300));
    location.reload();
}

function main(cookieMap) {
    if (cookieMap != null && !cookieMap.get("all")) {
        return;
    }

    if (document.getElementsByTagName("h1").length != 0 && document.getElementsByTagName("h1")[0].textContent == "Forbidden") {
        reload();
    }

    // search results (view? normal, do? GESS)
    // view, wasn't changed already, doesnt have error -> still in selection
    if ((window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?") ||
        window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.do?")) &&
        document.getElementById("customereview") == null &&
        document.getElementsByClassName("error").length == 0) {
        addCustomDiv();
        if (cookieMap == null || cookieMap.get("filter")) {
            addCheckbox("sessionexam", "Session examination");
            addCheckbox("endexam", "End of semester examination");
            addCheckbox("semesterperf", "(un)graded Semester performance");
            addFilterButton();
            addCheckbox("slow", "Slowmode to not get 403.");
        }
        if (cookieMap == null || cookieMap.get("rating")) {
            addCourseReviewRating();
        }
        if (cookieMap == null || cookieMap.get("timetable")) {
            addCourseSelector();
        }
        if (cookieMap == null || cookieMap.get("hover")) {
            addToolTipHover(cookieMap);
        }
    }

    // search selection
    // pre.view or view with error
    if (window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebotPre.view") ||
        window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?") &&
        document.getElementsByClassName("error").length != 0) {

        if (cookieMap != null || cookieMap.get("enter")) {
            document.addEventListener(
                "keydown",
                (event) => {
                    console.log("key press");
                    if (event.defaultPrevented) {
                        return; // Do nothing if the event was already processed
                    }
                    if (event.key == "Enter") {
                        document.getElementById("sucheLehrangebot").submit();
                        // Cancel the default action to avoid it being handled twice
                        event.preventDefault();
                    }
                },
                true,
            );
        }

        addCustomDiv();

        var formButtons = document.createElement('div');
        formButtons.className = "formButtons";
        var left = document.createElement('div');
        left.className = "left";
        formButtons.appendChild(left);
        var right = document.createElement('div');
        right.className = "right";
        formButtons.appendChild(right);
        document.getElementById("customreview").appendChild(formButtons);

        addButtonWithFunc("Clear all LocalStorage", function () { localStorage.clear(); location.reload(); }, right);
        if (cookieMap == null || cookieMap.get("autofill")) {
            addCheckboxAutofill(left);
            addButtonWithFunc("Clear Search", function () {
                localStorage.removeItem("studiengangTypExt");
                localStorage.removeItem("deptIdExt");
                localStorage.removeItem("studiengangAbschnittIdExt");
                localStorage.removeItem("bereichAbschnittIdExt");
                localStorage.removeItem("unterbereichAbschnittIdExt");
            }, left);
            keepSearch();
        }
        if (cookieMap == null || cookieMap.get("timetable")) {
            createTimeTable();
        }
    }

    if (cookieMap == null || cookieMap.get("crlinks")) {
        var all = document.body.querySelectorAll("*");
        recAddUrls(all);
    }
}

function addCustomDiv() {
    var div = document.createElement('div');
    div.id = "customreview";
    div.style = "margin-left: 1.5%; margin-right:1.5%";
    document.getElementById("contentTop").appendChild(div);
}

function addButtonWithFunc(text, func, parent) {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = text;
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = func;
    if (parent == null) {
        document.getElementById("customreview").appendChild(button);
        document.getElementById("customreview").appendChild(document.createElement('br'));
    } else {
        parent.appendChild(button);
    }
}

function addCheckbox(id, name, checked) {
    // Create the checkbox element
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = name;
    if (checked == null) {
        checkbox.checked = true;
    } else {
        checkbox.checked = checked;
    }

    // Create a label for the checkbox
    var label = document.createElement('label');
    label.htmlFor = id;
    label.appendChild(document.createTextNode(name));

    // Append the checkbox and label to the webpage
    document.getElementById("customreview").appendChild(checkbox);
    document.getElementById("customreview").appendChild(label);
    document.getElementById("customreview").appendChild(document.createElement('br'));
}