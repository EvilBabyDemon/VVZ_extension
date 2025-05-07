function recAddUrls(e) {
    [...e].forEach((element) => {
        var c = element.children;
        if (c.length == 0) {
            if (element.tagName != "A") {
                element.innerHTML = element.innerHTML.replaceAll(
                    /(\d{3}-\d{4}-[0-9A-Z]{3})/g,
                    '<a href="https://coursereview.ch/course/$&" target="_blank">$&</a>'
                );
            }
        } else {
            recAddUrls(c);
        }
    });
}

function addIconsIfReview() {
    let courseLinks = document.querySelectorAll(
        "a[href^='https://coursereview.ch/course/']"
    );

    courseLinks.forEach(function (link) {
        if (link.getElementsByTagName("span").length != 0 ) {
            console.log(link.getElementsByTagName("span"));
            return;
        }
        let span = document.createElement("span");
        link.appendChild(span);

        //request the api with the course code
        //https://cr.vsos.ethz.ch/getReviews?course=851-0708-00L
        let courseCode = link.href.split("/course/")[1];
        let xhr = new XMLHttpRequest();
        xhr.open(
            "GET",
            "https://cr.vsos.ethz.ch/getReviews?course=" + courseCode
        );
        xhr.send();
        xhr.onerror = function () {
            console.log("Network error occurred");
        };

        xhr.onload = function () {
            if (xhr.status == 200) {
                //check if data == [] or null
                let data = JSON.parse(xhr.responseText);
                if (data != null && data.length != 0) {
                    if (data.length == 1) {
                        span.textContent = "🗩";
                    } else if (data.length == 2) {
                        span.textContent = "🗪";
                    } else {
                        span.textContent = "🗫";
                    }
                    //inherit style everything from the link
                    //make colour golden
                    span.style.color = "goldenrod";
                }
            } else {
                console.log(
                    "Error Code: " + xhr.status + " for index " + index
                );
            }
        };
    });
}