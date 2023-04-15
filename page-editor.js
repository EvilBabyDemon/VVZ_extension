if (localStorage.getItem("all") != null && localStorage.getItem("all") != "true") {
    exit();
}


// search results
if (window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?") && document.getElementById("customereview") == null) {
    addCustomDiv();
    if (localStorage.getItem("filter") == null || localStorage.getItem("filter") == "true") {
        addCheckbox("sessionexam", "Session examination");
        addCheckbox("endexam", "End of semester examination");
        addCheckbox("semesterperf", "(un)graded Semester performance");
        addFilterButton();
        addCheckbox("slow", "Slowmode to not get 403.");
    }
    if (localStorage.getItem("rating") == null || localStorage.getItem("rating") == "true") {
        addCourseReviewRating();
    }
    if (localStorage.getItem("timetable") == null || localStorage.getItem("timetable") == "true") {
        addCourseSelector();
    }
}

// search selection
if (window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebotPre.view")) {
    addCustomDiv();

    addClearButton("Clear all LocalStorage", function () { localStorage.clear(); });
    if (localStorage.getItem("autofill") == null || localStorage.getItem("autofill") == "true") {
        addCheckboxAutofill();
        addClearButton("Clear Search", function () {
            localStorage.removeItem("studiengangTypExt");
            localStorage.removeItem("deptIdExt");
            localStorage.removeItem("studiengangAbschnittIdExt");
            localStorage.removeItem("bereichAbschnittIdExt");
            localStorage.removeItem("unterbereichAbschnittIdExt");
        });
        keepSearch();
    }
    if (localStorage.getItem("timetable") == null || localStorage.getItem("timetable") == "true") {
        createTimeTable();
        addClearButton("Clear Courses", function () { localStorage.removeItem("courses"); });
    }
}

if (localStorage.getItem("crlinks") == null || localStorage.getItem("crlinks") == "true") {
    var all = document.body.querySelectorAll("*");
    recAddUrls(all);
}

function addCustomDiv() {
    var div = document.createElement('div');
    div.id = "customreview";
    div.style = "margin-left: 1.5%;";
    document.getElementById("contentTop").appendChild(div);
}

function addClearButton(text, func) {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = text;
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = func;
    document.getElementById("customreview").appendChild(button);
    document.getElementById("customreview").appendChild(document.createElement('br'));
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