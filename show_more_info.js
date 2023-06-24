let hoverCourseString = "Course";
let hoverExamString = "Perform. Ass.";
let hoverCatDataString = "Course Info."
let hoverLearningString = "Learn. Mat.";
let hoverGroupsString = "Groups";
let hoverRestrictString = "Restrictions";
let hoverOfferedString = "Offered";



function addToolTipHover(cookieMap) {
    var trs = document.querySelectorAll("tr");
    trs.forEach(r => {
        var tds = r.getElementsByTagName("td");
        if (tds.length > 2 && tds[0].className == "border-no") {
            function makediv(content) {

                var div = document.createElement("div");
                div.classList.add("menu-container");
                div.onmouseover = function (event) { addPopOut(event, content) };

                innerdiv = document.createElement("div");
                innerdiv.classList.add("menu-trigger");
                innerdiv.textContent = content;
                div.appendChild(innerdiv);
                return div;
            }

            var td = tds[1];
            if (cookieMap != null && cookieMap.get("hovercourse")) {
                td.appendChild(makediv(hoverCourseString));
            }
            if (cookieMap == null || cookieMap.get("hoverperform")) {
                td.appendChild(makediv(hoverExamString));
            }
            if (cookieMap == null || cookieMap.get("hovercatdata")) {
                td.appendChild(makediv(hoverCatDataString));
            }
            if (cookieMap != null && cookieMap.get("hoverlearnmat")) {
                td.appendChild(makediv(hoverLearningString));
            }
            if (cookieMap != null && cookieMap.get("hovergroups")) {
                td.appendChild(makediv(hoverGroupsString));
            }
            if (cookieMap != null && cookieMap.get("hoverrestrict")) {
                td.appendChild(makediv(hoverRestrictString));
            }
            if (cookieMap != null && cookieMap.get("hoveroffered")) {
                td.appendChild(makediv(hoverOfferedString));
            }
        }
    });
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(`.menu-container {
        position: relative;
        display: inline-block;
        margin: 1px;
      }`));
    style.appendChild(document.createTextNode(`.menu {
        position: absolute;
        top: 100%;
        
        z-index: 30;
        width: 790px;
        left: -170px;
        display: none;
        padding: 10px;
        background-color: #f1f1f1;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }`));
    style.appendChild(document.createTextNode(".menu-trigger { padding: 7px; background-color: #f1f1f1; border-radius: 5px; font-size: 80%; }"));
    style.appendChild(document.createTextNode(".menu-container:hover .menu { display: block; }"));
    document.head.appendChild(style);
}

function addPopOut(event, content) {
    var menucont = event.target.parentNode;
    if (menucont == null || !event.target.classList.contains("menu-trigger") || menucont.querySelector(".menu") != null) {
        return;
    }

    var urls = menucont.parentNode.getElementsByTagName("a");
    if (urls.length != 0) {
        const xhr = new XMLHttpRequest();

        var url_end = urls[0].href.match(/(\/Vorlesungsverzeichnis\/lerneinheit.view\?lerneinheitId=\d+&semkez=\d+[SW]&)/g);
        var url = window.location.href.match(/https:\/\/www\..*\.ethz\.ch/)[0];
        var lang = window.location.href.match(/lang=../)[0];
        if (lang == null) {
            lang = "lang=de";
        }
        url = url + decodeHtml(url_end);
        if (hoverCourseString == content) {
            url = url + "ansicht=LEHRVERANSTALTUNGEN&" + lang;
        } else if (hoverExamString == content) {
            url = url + "ansicht=LEISTUNGSKONTROLLE&" + lang;
        } else if (hoverCatDataString == content) {
            url = url + "ansicht=KATALOGDATEN&" + lang;
        } else if (hoverLearningString == content) {
            url = url + "ansicht=LERNMATERIALIEN&" + lang;
        } else if (hoverGroupsString == content) {
            url = url + "ansicht=GRUPPEN&" + lang;
        } else if (hoverRestrictString == content) {
            url = url + "ansicht=EINSCHRAENKUNGEN&" + lang;
        } else if (hoverOfferedString == content) {
            url = url + "ansicht=STUDPLANINFO&" + lang;
        }

        console.log(url);
        xhr.open("GET", url);
        xhr.send();
        xhr.onerror = function () {
            console.log("Network error occurred");
        }

        xhr.onload = function () {
            if (xhr.status == 200) {
                var xmlDoc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
                var table = xmlDoc.getElementById("contentContainer").getElementsByTagName("table")[1];
                popout = document.createElement("div");
                popout.appendChild(table);
                popout.classList.add("menu");
                menucont.appendChild(popout);
            } else {
                console.log("Error Code: " + xhr.status + " for index " + index);
            }
        }

    }
}
