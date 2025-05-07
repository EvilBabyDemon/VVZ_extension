function addCourseReviewRating() {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(".stars-outer { display: inline-block; position: relative; font-size: 1vw;}"));
    style.appendChild(document.createTextNode(".stars-outer::before { content: '☆ ☆ ☆ ☆ ☆';}"));
    style.appendChild(document.createTextNode(".stars-inner::before { content: '★ ★ ★ ★ ★'; color: #FFD700;}"));
    style.appendChild(document.createTextNode(".stars-inner { position: absolute; top: 0; left: 0; white-space: nowrap; overflow: hidden; font-size: 1vw;}"));
    document.head.appendChild(style);

    var levels = document.getElementsByClassName("td-level");

    for (td of levels) {
        td.colSpan = 12;
    }

    var trs = document.querySelectorAll("tr");
    trs.forEach(async r => {
        var tds = r.getElementsByTagName("td");
        var ths = r.getElementsByTagName("th");

        if (ths.length > 1) {
            var desc = ["Would recommend it", "Interesting content", "Approriate difficulty", "Approriate amount of effort", "Amount and quality of resources"];
            for (d of desc) {
                var th = document.createElement("th");
                th.textContent = d;
                r.appendChild(th);
            }
        }

        if (tds.length > 5 && tds[0].className == "border-no") {
            const courseNr = tds[0].textContent;
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "https://cr.vsos.ethz.ch/getRatingsAvg?course=" + courseNr);
            xhr.send();
            xhr.onerror = function () {
                console.log("Network error occurred");
            }

            xhr.onload = function () {
                if (xhr.status == 200) {
                    let data = JSON.parse(xhr.responseText);
                    for (let key in data) {
                        var td = document.createElement("td")
                        if (data[key] != null) {
                            td.textContent = parseFloat(data[key]).toFixed(2);
                        }
                        r.appendChild(td);
                    }
                } else {
                    console.log("Error Code: " + xhr.status);
                }
            }
        }
    });
}