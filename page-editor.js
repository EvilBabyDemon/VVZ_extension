all = document.body.querySelectorAll("*");
recAddUrls(all);

if (window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?") && document.getElementById("customereview") == null) {
    addCustomDiv();
    addCheckbox("sessionexam", "Session examination");
    addCheckbox("endexam", "End of semester examination");
    addCheckbox("semesterperf", "(un)graded Semester performance");
    addFilterButton();
    addCheckbox("slow", "Slowmode to not get 403.");
    addCourseSelector();
}

if (window.location.href.includes(".ethz.ch/Vorlesungsverzeichnis/sucheLehrangebotPre.view")) {
    addCustomDiv();

    addCheckboxAutofill();
    addClearButton();
    keepSearch();
}

function recAddUrls(e) {
    [...e].forEach(element => {
        c = element.children;
        if (c.length == 0) {
            if (element.tagName != "A"){ 
                element.innerHTML = element.innerHTML.replaceAll(/(\d{3}-\d{4}-[0-9A-Z]{3})/g, "<a href=\"https://n.ethz.ch/~lteufelbe/coursereview/course/$&/\" target=\"_blank\">$&</a>");
            }
        } else {
            recAddUrls(c);
        }
    });
}

function autoSubmit(pFormName) {
	var lInput = document.createElement("input");
	lInput.type = "hidden";
	lInput.name = "refresh";
	lInput.value = "on";
	var form = document.getElementsByName(pFormName)[0];
	form.appendChild(lInput);
	form.submit();
}
function showWait(pName) {
	try {
		document.getElementById(pName).style.display = "inline";
	} catch (ex) {
	}
}

function keepSearch() {
    if (localStorage.autofill && localStorage.autofill == "false") {
        return;
    }

    var stud = document.getElementById("studiengangAbschnittId");

    const studsel = [...stud.children].filter( element => {
        return element.selected;
    })[0];

    if (studsel.innerHTML == "") {
        if (localStorage.studiengangAbschnittIdExt){
            [...stud.children].forEach(async element => {
                if (element.textContent == localStorage.studiengangAbschnittIdExt) {
                    element.selected = true;
                    showWait('waitStudiengangId');
                    await new Promise(r => setTimeout(r, 300));
                    autoSubmit('sucheLehrangebot');
                    return;
                }
            });
        }
    } else {
        localStorage.studiengangAbschnittIdExt = studsel.textContent;
    }

    var ber = document.getElementById("bereichAbschnittId");
    if (ber == null) {
        return;
    }
    const bersel = [...ber.children].filter( element => {
        return element.selected;
    })[0];

    if (bersel.innerHTML == "") {   
        if (localStorage.bereichAbschnittIdExt) {
            [...ber.children].forEach(element => {
                if (element.textContent == localStorage.bereichAbschnittIdExt) {
                    element.selected = true;
                    showWait('waitBereich');
                    autoSubmit('sucheLehrangebot');
                    return;
                }
            });
        }
    } else {
        localStorage.bereichAbschnittIdExt = bersel.textContent;
    }

    var unt = document.getElementById("unterbereichAbschnittId");
    if (unt == null) {
        return;
    }
    const untsel = [...unt.children].filter( element => {
        return element.selected;
    })[0];

    if (untsel.innerHTML == "") {
        if (localStorage.unterbereichAbschnittIdExt) {

            [...unt.children].forEach(element => {
                if (element.textContent == localStorage.unterbereichAbschnittIdExt) {
                    element.selected = true;
                    return;
                }
            });
        }
    } else {
        localStorage.unterbereichAbschnittIdExt = untsel.textContent;
    }
}


function addCustomDiv() {
    var div = document.createElement('div');
    div.id = "customreview";
    div.style = "margin-left: 1.5%;";
    document.getElementById("contentTop").appendChild(div);
}

function addCheckbox(id, name) {
    // Create the checkbox element
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = name;
    checkbox.checked = true;

    // Create a label for the checkbox
    var label = document.createElement('label');
    label.htmlFor = id;
    label.appendChild(document.createTextNode(name));

    // Append the checkbox and label to the webpage
    document.getElementById("customreview").appendChild(checkbox);
    document.getElementById("customreview").appendChild(label);
    document.getElementById("customreview").appendChild(document.createElement('br'));
}

function addCheckboxAutofill() {
    var id = "autofill";
    var checkname = "Autofill Structure";
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = checkname;
    if(localStorage.autofill && localStorage.autofill == "false") {
        checkbox.checked = false;
    } else {
        checkbox.checked = true;
    }
    checkbox.addEventListener('input', updateValue)
    function updateValue(e) {
        localStorage.autofill = "" + e.target.checked;
        keepSearch();
    }
    
    // Create a label for the checkbox
    var label = document.createElement('label');
    label.htmlFor = id;
    label.appendChild(document.createTextNode(checkname));

    var script = document.createElement('script');

    // Append the checkbox and label to the webpage
    document.getElementById("customreview").appendChild(checkbox);
    document.getElementById("customreview").appendChild(label);
    document.getElementById("customreview").appendChild(document.createElement('br'));
}

function addFilterButton() {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "Filter";
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = function(){
        course_filter(document.getElementById("sessionexam").checked, document.getElementById("endexam").checked, document.getElementById("semesterperf").checked, document.getElementById("slow").checked);
    };
    document.getElementById("customreview").appendChild(button);
    document.getElementById("customreview").appendChild(document.createElement('br'));
}

function addClearButton() {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "Clear LocalStorage";
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = function(){
        localStorage.clear();
    };
    document.getElementById("customreview").appendChild(button);
    document.getElementById("customreview").appendChild(document.createElement('br'));
}



function course_filter(session, end, semester, slow) {
    const errdiv = document.getElementById("coursereview403");
    if (errdiv != null) {
        errdiv.remove();
    } 
    if (session && end  && semester || !session && !end  && !semester) {
        return;
    }
    

    const string = document.body.innerHTML;
    const res = [...string.matchAll(/<td><b><a href="(\/Vorlesungsverzeichnis\/lerneinheit.view\?lerneinheitId=\d+&amp;semkez=\d+[SW]&amp;).+?">.+?<\/a><\/b>/g)];
    var trs = document.querySelectorAll("tr");
    var trsf = [...trs].filter(element => {
        tds = element.getElementsByTagName("td");
        return tds.length > 0 && tds[0].className == "border-no";
    });

    res.forEach(async (element, index) => {
        if (slow) {
            await new Promise(r => setTimeout(r, index*500));
        }
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.vvz.ethz.ch" + decodeHtml(element[1]) + "ansicht=LEISTUNGSKONTROLLE&lang=de");
        xhr.send();
        xhr.onerror = function() {
            console.log("Network error occurred");
        }

        xhr.onload = function() {
            if (xhr.status == 200) {
                const mode = xhr.responseText.match(/<tr><td>Form<\/td><td>(.+?)<\/td><\/tr>/);
                if(!session && decodeHtml(mode[1])=="Sessionsprüfung" || !end && decodeHtml(mode[1])=="Semesterendprüfung" || !semester && decodeHtml(mode[1]).endsWith("benotete Semesterleistung")) {
                    trsf[index].remove();
                }
            } else if (xhr.status == 403) {
                if (document.getElementById("coursereview403") == null) {
                    var div = document.createElement('div');
                    div.id = "coursereview403";
                    div.textContent = "403 Error Code. You will have to run again to properly filter everything! Best to wait a bit and use the slowmode.";
                    div.style = "color: red;";
                    document.getElementById("customreview").appendChild(div);
                }
            } else {
                console.log ("Error Code: " + xhr.status + " for index " + index);
            }
        }
        xhr.onerror = function() {
            console.log("Network error occurred")
        }
    });
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function addCourseSelector() {
    var trs = document.querySelectorAll("tr");
    trs.forEach(r => {
        tds = r.getElementsByTagName("td");
        if (tds.length > 1 && tds[0].className == "border-no") {
            url = tds[1].getElementsByTagName("A")[0];
            console.log(url);
            console.log(url.href);
            match = url.href.match(/lerneinheitId=\d+&semkez=\d+[SW]/);
            addTimeButton(tds[0], match[0]);
        }
    });
}


function addTimeButton(tr_elem, id) {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "add to timetable";
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = function(){
        saveCourse(id);
    };
    tr_elem.appendChild(button);
}

function saveCourse(id) {
    //id is of format lerneinheitId=168203 semkez=2023S
    if(localStorage.courses) {
        localStorage.courses = localStorage.courses + " " + id;
    } else {
        localStorage.courses = id;
    } 
}

