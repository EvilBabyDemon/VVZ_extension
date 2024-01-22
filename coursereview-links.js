function recAddUrls(e) {
    [...e].forEach((element) => {
        var c = element.children;
        if (c.length == 0) {
            if (element.tagName != "A") {
                element.innerHTML = element.innerHTML.replaceAll(
                    /(\d{3}-\d{4}-[0-9A-Z]{3})/g,
                    '<a href="https://n.ethz.ch/~lteufelbe/coursereview/?course=$&" target="_blank">$&</a>'
                );
            }
        } else {
            recAddUrls(c);
        }
    });

    let courseLinks = document.querySelectorAll(
        "a[href^='https://n.ethz.ch/~lteufelbe/coursereview/?course=']"
    );

    courseLinks.forEach(function (link) {
        //request the api with the course code
        //https://rubberducky.vsos.ethz.ch:1855/course/851-0708-00L
        let courseCode = link.href.split("=")[1];
        let xhr = new XMLHttpRequest();
        xhr.open(
            "GET",
            "https://rubberducky.vsos.ethz.ch:1855/course/" + courseCode
        );
        xhr.send();
        xhr.onerror = function () {
            console.log("Network error occurred");
        };

        xhr.onload = function () {
            if (xhr.status == 200) {
                //check if data == []
                let data = JSON.parse(JSON.parse(xhr.responseText));
                console.log(data);
                console.log(data.length);
                if (data.length != 0) {
                    let span = document.createElement("span");
                    if (data.length == 1) {
                        span.textContent = "🗩";
                    } else if (data.length == 2) {
                        span.textContent = "🗪";
                    } else {
                        span.textContent = "🗫";
                    }
                    //inherit style everything from the link
                    //make colour golden
                    span.style.color = "goldenrod   ";
                    link.appendChild(span);
                }
            } else {
                console.log(
                    "Error Code: " + xhr.status + " for index " + index
                );
            }
        };
    });
}