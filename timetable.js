let coursesLocalStorage = "courses";
let coursesECTSLocalStorage = "coursesECTS";

function getFromLocal(storageId) {
    var map = new Map();
    if (localStorage.getItem(storageId)) {
        map = new Map(JSON.parse(localStorage.getItem(storageId)));
    }
    return map;
}

function setLocal(storageId, map) {
    localStorage.setItem(storageId, JSON.stringify(Array.from(map.entries())));
}

function deleteEntry(id) {
    //id is of format lerneinheitId=168203&semkez=2023S
    if (localStorage.getItem(coursesLocalStorage)) {
        var courseMap = getFromLocal(coursesLocalStorage);
        courseMap.delete(id);
        setLocal(coursesLocalStorage, courseMap);
    }
    if (localStorage.getItem(coursesECTSLocalStorage)) {
        var ectsMap = getFromLocal(coursesECTSLocalStorage);
        ectsMap.delete(id);
        setLocal(coursesECTSLocalStorage, ectsMap);
    }
}

function saveCourse(id, courseName, ects) {
    //id is of format lerneinheitId=168203&semkez=2023S
    var courseMap = getFromLocal(coursesLocalStorage);
    courseMap.set(id, courseName);
    setLocal(coursesLocalStorage, courseMap);

    var ectsMap = getFromLocal(coursesECTSLocalStorage);
    ectsMap.set(id, ects);
    setLocal(coursesECTSLocalStorage, ectsMap);
}

function addCheckboxTable(id, name, table, remove) {
    // Create the checkbox element
    var tr = document.createElement('tr');
    var tdstyle = "padding: 2px 9px 1px 0px; border: none; width: auto; font-weight: inherit; font-size: inherit; color: inherit;";
    var tdInput = document.createElement('td');
    tdInput.style = tdstyle;
    var tdButton = document.createElement('td');
    tdButton.style = tdstyle;
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = name;
    if (remove == null) {
        checkbox.checked = true;
    } else {
        checkbox.checked = remove;
    }

    // Create a label for the checkbox
    var label = document.createElement('label');
    label.htmlFor = id;
    label.appendChild(document.createTextNode(name));

    // Append the checkbox and label to the webpage
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "🗑";
    button.style = "color: #f00; background: none; border: none; border-radius: 0; padding: 5px 5px 5px 5px;";
    button.onclick = function () {
        //id is of format lerneinheitId=168203&semkez=2023S
        deleteEntry(id);
        location.reload();
    };
    tdInput.appendChild(checkbox);
    tdInput.appendChild(label);
    if (remove == null || remove) {
        tdButton.appendChild(button);
    }
    tr.appendChild(tdInput);
    tr.appendChild(tdButton);
    table.appendChild(tr);
}


function addCourseSelector() {
    var trs = document.querySelectorAll("tr");
    trs.forEach(r => {
        var tds = r.getElementsByTagName("td");
        if (tds.length > 3 && tds[0].className == "border-no") {
            var url = tds[1].getElementsByTagName("A")[0];
            var ects = parseInt(tds[3].textContent.replace("KP", "").trim());
            var match = url.href.match(/lerneinheitId=\d+&semkez=\d+[SW]/);
            addTimeButton(tds[0], match[0], url.textContent, ects);
        }
    });
}


function addTimeButton(tr_elem, id, courseName, ects) {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "add to timetable";
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = function () {
        saveCourse(id, courseName, ects);
    };
    tr_elem.appendChild(button);
}



async function createTimeTable() {
    document.getElementById("customreview").appendChild(document.createElement('br'));
    if (localStorage.getItem(coursesLocalStorage)) {
        var tableCourses = document.createElement('table');
        tableCourses.style = "border: none; width: auto;";
        var courseMap = getFromLocal(coursesLocalStorage);
        for (course of courseMap) {
            addCheckboxTable(course[0], course[1], tableCourses);
        }
        addCheckboxTable("showAllExt", "Show all Exercise sessions etc.", tableCourses, false);

        document.getElementById("customreview").appendChild(tableCourses);
    }

    var formButtons = document.createElement('div');
    formButtons.className = "formButtons";
    var left = document.createElement('div');
    left.className = "left";
    formButtons.appendChild(left);
    var right = document.createElement('div');
    right.className = "right";
    formButtons.appendChild(right);

    var create = document.createElement('button');
    create.type = "submit";
    create.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    var remove = create.cloneNode(false);

    create.id = "createTimetable";
    create.textContent = "Create Timetable";
    create.onclick = function () {
        document.getElementById("createTimetable").disabled = true;
        try {
            document.getElementById("waitTimetable").style.display = "inline";
        } catch (ex) {
        }
        timeTable();
    };

    var img = document.createElement("img");
    img.src = "images/wait.gif";
    img.id = "waitTimetable";
    img.style.display = "none";
    img.alt = "Loading timetable";
    img.width = "16";
    img.height = "16";

    left.appendChild(create);
    left.appendChild(img);
    var ectsMap = getFromLocal(coursesECTSLocalStorage);
    var courseMap = getFromLocal(coursesLocalStorage);
    
    if (courseMap.size > 0) { //TODO: remove code in 5 versions
        var url = window.location.href.match(/https:\/\/www\..*\.ethz\.ch/)[0];
        for (const key of courseMap.keys()) {
            if (!ectsMap.get(key)) {
                let unitReq = await fetch(`${url}/lerneinheit.view?ansicht=LEISTUNGSKONTROLLE&${key}`);
                let unitHTML = await unitReq.text();
                const dom = new DOMParser().parseFromString(unitHTML.replace(/&nbsp;/g, " "), "text/html");
                let tabel = dom.getElementsByTagName("table")[1];
                var trEcts = tabel.getElementsByTagName("tr")[2];
                var tdEcts = trEcts.getElementsByTagName("td")[1];
                var ects = parseInt(tdEcts.textContent.replace("KP", "").trim());
                ectsMap.set(key, ects);
                setLocal(coursesECTSLocalStorage, ectsMap);
            }
        }
    }

    if (ectsMap.size > 0) {
        var ectsSum = 0;
        for (const key of ectsMap.keys()) {
            ectsSum += ectsMap.get(key);
        }
        left.append(" ECTS: " + ectsSum);
    }

    remove.textContent = "Remove all Courses";
    remove.onclick = function () {
        localStorage.removeItem(coursesLocalStorage);
        localStorage.removeItem(coursesECTSLocalStorage);
        location.reload();
    };

    right.appendChild(remove);

    document.getElementById("customreview").appendChild(formButtons);
    document.getElementById("customreview").appendChild(document.createElement('br'));

}

async function timeTable() {

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

        var hours = [];

        for (const row of courseTable) {
            const courseType = row.querySelectorAll("td")[0].textContent.split(" ")[1];
            const numHours = parseInt(row.querySelectorAll("td")[2].textContent);
            const table = row.querySelectorAll("td")[3];

            const fields = table.getElementsByTagName("td");
            var currDay = "";
            var data = [];
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

    if (!localStorage.getItem(coursesLocalStorage)) {
        return;
    }

    var courseRows = getFromLocal(coursesLocalStorage);
    let htmls = [];

    var url = window.location.href.match(/https:\/\/www\..*\.ethz\.ch/)[0];
    for (const r of courseRows.keys()) {
        if (document.getElementById(r) != null && document.getElementById(r).checked) {
            console.log(`${url}/lerneinheit.view?${r}`);
            let unitReq = await fetch(`${url}/lerneinheit.view?${r}`);
            let unitHTML = await unitReq.text();
            htmls.push(unitHTML);
            console.log(`${url}${r}`);
            console.log(unitReq.status);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    let dataset = [];
    for (const html of htmls) {
        const dom = new DOMParser().parseFromString(html.replace(/&nbsp;/g, " "), "text/html");
        const data = extractData(dom);
        dataset.push(data);
    }


    //Create html table 
    var table = document.createElement("table");
    table.id = "timetable";
    if (document.getElementById("timetable") != null) {
        table = document.getElementById("timetable");
        table.innerHTML = "";
    }
    table.className = "classlist";
    table.style = "width: 100%;";
    var tbody = document.createElement("tbody");
    var trh = document.createElement("tr");
    var thf = document.createElement("th");
    thf.style = "width:5%; font-size: 14px; text-align: left; font-weight: normal; padding: 3px 5px 3px 5px; vertical-align: top; border-top: 1px solid #ccc; background-color:#eee";
    thf.text = "Begin";
    trh.appendChild(thf);

    for (d of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
        var th = document.createElement("th");
        th.style = "width:19%; font-size: 14px; text-align: center; padding: 3px 5px 3px 5px; vertical-align: top; background-color:#eee";
        th.textContent = d;
        trh.appendChild(th);
    }
    tbody.appendChild(trh);

    var showAll = document.getElementById("showAllExt") != null && document.getElementById("showAllExt").checked;
    var perDay = new Map();
    for (day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
        var perHour = new Map();
        for (let i = 8; i < 20; i++) {
            var currHour = new Map();
            for (let j = 0; j < dataset.length; j++) {
                var entry = dataset[j];
                for (hours of entry.hours) {
                    for (time of hours.time) {
                        if (time.day == day && time.start <= i && i < time.end) {
                            //hours.type time.start time.end  if show all + time.room
                            var timeId = entry.id + " " + hours.type + " " + time.start + " " + time.end;

                            var text = hours.type + " " + entry.name;
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
    var allOverlaps = new Map();
    for (day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
        var overlaps = new Map();

        for (let i = 8; i < 20;) {
            var minT = i;
            var maxT = i;

            //invariant:
            // there is no course that started before i and is still going at i 
            redo: for (let j = 0; j < dataset.length; j++) {
                var entry = dataset[j];
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
            i = maxT;
        }
        allOverlaps.set(day, overlaps);
    }

    for (let i = 8; i < 20; i++) {
        var tr = document.createElement("tr");
        var tdf = document.createElement("td");
        tdf.style = "height: 60px; vertical-align: top; padding: 5px 0px; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc;";
        tdf.textContent = i;
        tr.appendChild(tdf);

        for (day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
            var empty = true;
            var dayOv = allOverlaps.get(day);
            var td = document.createElement("td");
            if (dayOv != null) {
                for (ov of dayOv) {
                    if (ov[0] == i) {
                        //what is the width? / max courses overlap in the same time frame
                        var tdHeight = 70 * ov[1] + ov[1];
                        td.style = "border: none; padding: 0px;";
                        td.rowSpan = ov[1];

                        var maxCol = 0;
                        for (let j = i; j < i + ov[1]; j++) {
                            if (perDay.get(day).get(j) != null) {
                                maxCol = Math.max(maxCol, perDay.get(day).get(j).size);
                            }
                        }

                        var tableIn = document.createElement("table");
                        tableIn.style = "height: " + (tdHeight) + "px !important; border:none; padding: 0px; margin: 0px; overflow:hidden;";
                        var tbodyIn = document.createElement("tbody");

                        for (let j = i; j < i + ov[1]; j++) {
                            var trIn = document.createElement("tr");
                            for (values of perDay.get(day).get(j)) {
                                if (values[1][2] == false) {
                                    continue;
                                }
                                var tdIn = document.createElement("td");

                                tdIn.rowSpan = values[1][1];
                                var tdInHeight = values[1][1] * 100.0 / ov[1];
                                tdIn.style = "height: " + tdInHeight + "%; font-size: 13px; background:#ebf3f3; padding: 0px; text-align: center; vertical-align: middle; border: none; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; font-weight: bold;  color: #666;"
                                tdIn.textContent = values[1][0];
                                trIn.appendChild(tdIn);
                            }
                            for (let k = perDay.get(day).get(j).size; k < maxCol; k++) {
                                var tdIn = document.createElement("td");
                                tdIn.appendChild(document.createElement("br"));
                                var tdInHeight = 100.0 / ov[1];
                                tdIn.style = "height: " + tdInHeight + "%;background:#ffffff;";
                                trIn.appendChild(tdIn);
                            }
                            tbodyIn.appendChild(trIn);
                        }

                        tableIn.appendChild(tbodyIn);
                        td.appendChild(tableIn);

                        empty = false;
                        tr.appendChild(td);
                    } else if (ov[0] < i && i < ov[0] + ov[1]) {
                        //do nothing as cell from above should fill it already
                        empty = false;
                        continue;
                    }
                }
            }

            if (empty) {
                td.style = "background:#ffffff; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc;";
                td.appendChild(document.createElement("br"));
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    }


    table.appendChild(tbody);
    document.getElementById("customreview").appendChild(table);

    //write non weekly lectures below timetable
    var extraText = document.createElement("div");
    if (document.getElementById("nonWeekly") != null) {
        extraText = document.getElementById("nonWeekly");
        extraText.innerHTML = "";
    } else {
        extraText.id = "nonWeekly";
    }
    extraText.textContent = "Non weekly lectures:";

    for (entry of dataset) {
        for (hours of entry.hours) {
            for (time of hours.time) {
                if (!["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(time.day)) {
                    //only add data which is defined
                    var innerExtra = document.createElement("p");
                    innerExtra.textContent = entry.name + " " + entry.id + " " + hours.type;
                    if (hours.id != null) {
                        innerExtra.textContent += " " + hours.id;
                    }

                    if (time.day != null) {
                        innerExtra.textContent += " " + time.day;

                    }
                    if (time.start != null && time.end != null) {
                        innerExtra.textContent += " " + time.start + "-" + time.end;
                    }
                    extraText.appendChild(innerExtra);
                }
            }
        }
    }
    document.getElementById("customreview").appendChild(extraText);
    try {
        document.getElementById("waitTimetable").style.display = "none";
    } catch (ex) {
    }
    document.getElementById("createTimetable").disabled = false;
}