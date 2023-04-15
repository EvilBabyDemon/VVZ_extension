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
        
        var url = window.location.href.match(/https:\/\/www\..*\.ethz\.ch/)[0];

        xhr.open("GET", url + decodeHtml(element[1]) + "ansicht=LEISTUNGSKONTROLLE&lang=de");
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
    });
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}