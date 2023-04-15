function recAddUrls(e) {
    [...e].forEach(element => {
        var c = element.children;
        if (c.length == 0) {
            if (element.tagName != "A") {
                element.innerHTML = element.innerHTML.replaceAll(/(\d{3}-\d{4}-[0-9A-Z]{3})/g, "<a href=\"https://n.ethz.ch/~lteufelbe/coursereview/course/$&/\" target=\"_blank\">$&</a>");
            }
        } else {
            recAddUrls(c);
        }
    });
}