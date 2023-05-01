function addCourseSelector() {
    var trs = document.querySelectorAll("tr");
    trs.forEach(r => {
        var tds = r.getElementsByTagName("td");
        if (tds.length > 1 && tds[0].className == "border-no") {
            var url = tds[1].getElementsByTagName("A")[0];
            var match = url.href.match(/lerneinheitId=\d+&semkez=\d+[SW]/);
            addTimeButton(tds[0], match[0], url.textContent);
        }
    });
}


function addTimeButton(tr_elem, id, courseName) {
    var button = document.createElement('button');
    button.type = "submit";
    button.textContent = "add to timetable";
    button.style = "color: #fff; background: #0069B4; border: none; border-radius: 0; padding: 5px 35px 5px 12px; font-weight: bold;";
    button.onclick = function () {
        saveCourse(id, courseName);
    };
    tr_elem.appendChild(button);
}

function saveCourse(id, courseName) {
    //id is of format lerneinheitId=168203&semkez=2023S
    var courseMap = new Map();
    if (localStorage.courses) {
        courseMap = new Map(JSON.parse(localStorage.courses));
    }
    courseMap.set(id, courseName);
    localStorage.courses = JSON.stringify(Array.from(courseMap.entries()));
}


function createTimeTable() {
    document.getElementById("customreview").appendChild(document.createElement('br'));
    if (localStorage.courses) {
        var courseMap = new Map(JSON.parse(localStorage.courses))
        for (course of courseMap) {
            addCheckbox(course[0], course[1]);
        }
        addCheckbox("showAllExt", "Show all Exercise sessions etc.", false);
    }

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

    if (!localStorage.courses) {
        return;
    }

    var courseRows = new Map(JSON.parse(localStorage.courses));
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
            await new Promise(resolve => setTimeout(resolve, 1000));
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
    var customrev = document.getElementById("customreview");
    if (customrev.getElementsByTagName("table").length != 0) {
        table = customrev.getElementsByTagName("table")[0];
        table.innerHTML = "";
    }
    table.className = "classlist";
    table.style = "width: 100%;";
    document.getElementById("customreview").appendChild(table);
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
                var entry = dataset[j]
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
                var entry = dataset[j]
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
                        var tdHeight = 70 * ov[1]+ov[1];
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
                                var tdInHeight = values[1][1]*100.0 / ov[1];
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
}