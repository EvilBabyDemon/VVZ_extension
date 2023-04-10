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

    createTimeTable();
}

function recAddUrls(e) {
    [...e].forEach(element => {
        c = element.children;
        if (c.length == 0) {
            if (element.tagName != "A") {
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

function keepField(field, storage, waitField) {

    if (field == null) {
        return;
    }

    const fieldsel = [...field.children].filter(element => {
        return element.selected;
    })[0];

    if (fieldsel.textContent == "") {
        if (storage) {
            [...field.children].forEach(async element => {
                if (element.textContent == storage) {
                    element.selected = true;
                    if (waitField != "") {
                        showWait(waitField);
                        await new Promise(r => setTimeout(r, 300));
                        autoSubmit('sucheLehrangebot');
                    }
                    return;
                }
            });
        }
    } else {
        storage = fieldsel.textContent;
    }
}

function keepSearch() {
    if (localStorage.autofill && localStorage.autofill == "false") {
        return;
    }

    keepField(document.getElementById("studiengangTyp"), localStorage.studiengangIdExt, "waitStudiengang");
    keepField(document.getElementById("deptId"), localStorage.deptIdExt, "waitDepartment");
    keepField(document.getElementById("studiengangAbschnittId"), localStorage.studiengangAbschnittIdExt, "waitStudiengangId");
    keepField(document.getElementById("bereichAbschnittId"), localStorage.bereichAbschnittIdExt, "waitBereich");
    keepField(document.getElementById("unterbereichAbschnittId"), localStorage.unterbereichAbschnittIdExt, "");

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
    if (localStorage.autofill && localStorage.autofill == "false") {
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
    button.onclick = function () {
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
    button.onclick = function () {
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
    if (session && end && semester || !session && !end && !semester) {
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
            await new Promise(r => setTimeout(r, index * 500));
        }
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.vvz.ethz.ch" + decodeHtml(element[1]) + "ansicht=LEISTUNGSKONTROLLE&lang=de");
        xhr.send();
        xhr.onerror = function () {
            console.log("Network error occurred");
        }

        xhr.onload = function () {
            if (xhr.status == 200) {
                const mode = xhr.responseText.match(/<tr><td>Form<\/td><td>(.+?)<\/td><\/tr>/);
                if (!session && decodeHtml(mode[1]) == "Sessionsprüfung" || !end && decodeHtml(mode[1]) == "Semesterendprüfung" || !semester && decodeHtml(mode[1]).endsWith("benotete Semesterleistung")) {
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
                console.log("Error Code: " + xhr.status + " for index " + index);
            }
        }
        xhr.onerror = function () {
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
    button.onclick = function () {
        saveCourse(id);
    };
    tr_elem.appendChild(button);
}

function saveCourse(id) {
    //id is of format lerneinheitId=168203 semkez=2023S
    if (localStorage.courses) {
        localStorage.courses = localStorage.courses + " " + id;
    } else {
        localStorage.courses = id;
    }
}


function createTimeTable() {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "Create Timetable";
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = function () {
        timeTable();
    };
    document.getElementById("customreview").appendChild(button);
    document.getElementById("customreview").appendChild(document.createElement('br'));

}

function timeTable() {
    script = document.createElement("script");
    script.innerHTML = "table.tablelist { width:100%; border-collapse:collapse ; empty-cells:show; border-bottom:1px solid #ccc; table-layout:auto; } table.tablelist th { padding: 3px 5px 3px 5px; vertical-align: top; border-top: 1px solid #ccc; text-align:left; font-size:11px; background-color:#eee;} table.tablelist td { padding: 0; border-top: 1px solid #ccc; vertical-align: top;} .td-border-top { border-top: 1px solid #ccc;} table.tablelist td.td-border-top-dotted, .td-border-top-dotted { border-top: 1px dotted #ccc;} .td-border-bottom { border-bottom: 1px solid #ccc;} .td-border-right { border-right:1px solid #ccc;} .td-border-left { border-left: 1px solid #ccc;} .td-border-left-dotted { border-left: 1px solid #e6e6e6;} table.tablelist .td-border-top-none { border-top: none; } table.tablelist.tablelist-ng td:first-child { vertical-align: middle; padding-left: 0; } table.table-nested { width:auto !important; table-layout: auto !important; border-collapse:collapse;} table.table-nested td { padding: 0; border:none; vertical-align: top;}";
    document.getElementsByTagName("head")[0].appendChild(script);

    const DAY_LOOKUP = {
        "Mo": "Mon",
        "Di": "Tue",
        "Mi": "Wed",
        "Do": "Thu",
        "Fr": "Fri"
    };

    function extractData(document) {
        const title = document.getElementById("contentTop").textContent.replace("\n", "");
        const courseID = title.split(/ +/)[0];
        const courseName = title.split(/ +/).slice(1).join(" ");

        const courseTable = [...document.querySelectorAll(".inside > table")[1].querySelector("tbody").children].slice(1);

        let hours = [];

        for (const row of courseTable) {
            const courseType = row.querySelectorAll("td")[0].textContent.split(" ")[1];
            const numHours = parseInt(row.querySelectorAll("td")[2].textContent);
            const table = row.querySelectorAll("td")[3];

            const fields = table.getElementsByTagName("td");
            let currDay = "";
            let data = [];
            for (let i = 0; i < fields.length; i += 3) {
                if (fields[i].textContent != "") {
                    currDay = DAY_LOOKUP[fields[i].textContent];
                    if (currDay == undefined) {
                        currDay = fields[i].textContent;
                    }
                }
                const time = fields[i + 1].textContent;
                const timeFrom = parseInt(time.split("-")[0].split(":")[0]);
                const timeTo = parseInt(time.split("-")[1].split(":")[0]);


                data.push({
                    room: fields[i + 2].textContent.replace(" »", ""),
                    day: currDay,
                    start: timeFrom,
                    end: timeTo
                });
            }
            hours.push({
                type: courseType,
                hourCount: numHours,
                time: data
            })
        }
        return {
            name: courseName,
            id: courseID,
            hours: hours
        };
    }

    const MAIN_REQ_URL = "https://www.vorlesungen.ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?lang=de&search=on&semkez=2023S&studiengangTyp=&deptId=&studiengangAbschnittId=102579&bereichAbschnittId=&lerneinheitstitel=&lerneinheitscode=&famname=&rufname=&wahlinfo=&lehrsprache=&periodizitaet=&kpRange=0%2C999&katalogdaten=&_strukturAus=on&search=Suchen";

    async function main() {
        courseRows = localStorage.courses.split(" ");
        let htmls = [];
        for (const r of courseRows) {
            console.log(`https://www.vorlesungen.ethz.ch/lerneinheit.view?${r}`);
            let unitReq = await fetch(`https://www.vorlesungen.ethz.ch/lerneinheit.view?${r}`);
            let unitHTML = await unitReq.text();
            htmls.push(unitHTML);
            console.log(`https://www.vorlesungen.ethz.ch${r}`);
            console.log(unitReq.status);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        let dataset = [];
        for (const html of htmls) {
            const dom = new DOMParser().parseFromString(html.replace(/&nbsp;/g, " "), "text/html");
            const data = extractData(dom);
            dataset.push(data);
            console.log(data.id, data.name, data.hours);
        }


        //Create html table 
        table = document.createElement("table");
        table.className = "classlist";
        table.style = "width: 100%;";
        document.getElementById("customreview").appendChild(table);
        tbody = document.createElement("tbody");
        trh = document.createElement("tr");
        thf = document.createElement("th");
        thf.style = "width:5%; font-size: 14px; text-align: left; font-weight: normal; padding: 3px 5px 3px 5px; vertical-align: top; border-top: 1px solid #ccc; background-color:#eee";
        thf.text = "Begin";
        trh.appendChild(thf);

        for (d of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
            th = document.createElement("th");
            th.style = "width:19%; font-size: 14px; text-align: center; padding: 3px 5px 3px 5px; vertical-align: top; border-top: 1px solid #ccc; background-color:#eee";
            th.textContent = d;
            trh.appendChild(th);
        }
        tbody.appendChild(trh);

        showAll = false; // make this setable
        perDay = new Map();
        for (day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
            perHour = new Map();
            for (let i = 8; i < 20; i++) {
                currHour = new Map();
                for (let j = 0; j < dataset.length; j++) {
                    entry = dataset[j]
                    for (hours of entry.hours) {
                        for (time of hours.time) {
                            if (time.day == day && time.start <= i && i < time.end) {
                                //hours.type time.start time.end  if show all + time.room
                                timeId = entry.id + " " + hours.type + " " + time.start + " " + time.end;

                                text = hours.type + " " + entry.name;
                                if (showAll) {
                                    timeId = timeId + " " + time.room;
                                    text = text + " " + time.room;
                                }

                                if (currHour.get(timeId) == null) {
                                    currHour.set(timeId, [text, time.end - time.start, time.start == i]);
                                }
                            }
                        }
                    }
                }
                perHour.set(i, currHour);
            }
            perDay.set(day, perHour);
        }

        //fixing overlap bugs
        allOverlaps = new Map();
        for (day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
            overlaps = new Map();

            for (let i = 8; i < 20;) {
                minT = i;
                maxT = i;

                //invariant:
                // there is no course that started before i and is still going at i 
                redo: for (let j = 0; j < dataset.length; j++) {
                    entry = dataset[j]
                    for (hours of entry.hours) {
                        for (time of hours.time) {
                            if (time.day != day) {
                                continue;
                            }
                            if (minT == time.start && maxT < time.end || minT <= time.start && time.start < maxT && time.end > maxT) {
                                maxT = time.end;
                                j = -1;
                                continue redo;
                                //start from start 
                            }
                        }
                    }
                }
                //no course at all
                if (minT == maxT) {
                    i++;
                    continue;
                }
                overlaps.set(i, maxT - minT);
                i = maxT
            }
            allOverlaps.set(day, overlaps);
        }

        for (let i = 8; i < 20; i++) {
            tr = document.createElement("tr");
            tdf = document.createElement("td");
            tdf.style = "height: 60px; vertical-align: top; padding: 5px 0px; border-right: 1px solid #ccc;";
            tdf.textContent = i;
            tr.appendChild(tdf);

            for (day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
                empty = true;
                dayOv = allOverlaps.get(day);
                td = document.createElement("td");
                if (dayOv != null) {
                    for (ov of dayOv) {
                        if (ov[0] == i) {
                            //what is the width? / max courses overlap in the same time frame
                            td.style = "padding: 0px; height: 100%; border-top: none;";
                            td.rowSpan = ov[1];

                            maxCol = 0;
                            for (let j = i; j < i + ov[1]; j++) {
                                if (perDay.get(day).get(j) != null) {
                                    maxCol = Math.max(maxCol, perDay.get(day).get(j).size);
                                }
                            }

                            tableIn = document.createElement("table");
                            tableIn.style = "height: 100% !important; border:none; padding: 0px; margin: 0px; overflow:hidden;";
                            tbodyIn = document.createElement("tbody");

                            for (let j = i; j < i + ov[1]; j++) {
                                trIn = document.createElement("tr");
                                addedData = false;
                                for (values of perDay.get(day).get(j)) {
                                    if (values[1][2] == false) {
                                        continue;
                                    }
                                    tdIn = document.createElement("td");

                                    tdIn.rowSpan = values[1][1];
                                    tdIn.style = "font-size: 13px; background:#ebf3f3; padding: 0px; text-align: center; vertical-align: middle; border: none; border-right: 1px solid #ccc; font-weight: bold;  color: #666;"
                                    tdIn.textContent = values[1][0];
                                    trIn.appendChild(tdIn);
                                    addedData = true;
                                }
                                for (let k = perDay.get(day).get(j).size; k < maxCol; k++) {
                                    tdIn = document.createElement("td");
                                    trIn.appendChild(tdIn);
                                    addedData = true;
                                }
                                if (addedData) {
                                    tbodyIn.appendChild(trIn);
                                }
                            }

                            tableIn.appendChild(tbodyIn);
                            td.appendChild(tableIn);

                            empty = false;
                            tr.appendChild(td);
                            //continue? either way there should be no data that enters this case anymore
                        } else if (ov[0] < i && i < ov[0] + ov[1]) {
                            //do nothing as cell from above should fill it already
                            empty = false;
                            continue;
                            //continue? either way there should be no data that enters this case anymore
                        }
                    }
                }

                if (empty) {
                    td.style = "background:#ffffff;border-right: 1px solid #ccc;";
                    td.appendChild(document.createElement("br"));
                    tr.appendChild(td);
                }
            }
            tbody.appendChild(tr);
        }


        table.appendChild(tbody);
        document.getElementById("customreview").appendChild(table);

        //write non weekly lectures below timetable
        extraText = document.createElement("div");
        extraText.textContent = "Non weekly lectures:";

        for (entry of dataset) {
            for (hours of entry.hours) {
                for (time of hours.time) {
                    if (!["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(time.day)) {
                        innerExtra = document.createElement("p");
                        innerExtra.textContent = entry.name + " " + entry.id + " " + hours.type + " " + hours.id + " " + time.day + " " + time.start + "-" + time.end;
                        extraText.appendChild(innerExtra);
                    }
                }
            }
        }
        document.getElementById("customreview").appendChild(extraText);
    }
    main();
}