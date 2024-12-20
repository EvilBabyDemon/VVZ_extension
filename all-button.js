function addAllButton() {
        [...document.getElementsByClassName("pagination")].forEach(pagination => {
        //search grey in pagination
        //pagination.includes("grey")
        var arr = pagination.getElementsByTagName("img")
        if (arr.length == 0) {  
            return;
        }
        var img = arr[arr.length - 1];
        if (img.src != null && img.src.includes("grey")) {
            return;
        }
        if (pagination.textContent.includes("All")) {
            return;
        }
        var allTag = document.createElement('a');
        //change href link seite=X to seite=0
        allTag.href = document.URL.replace(/seite=\d*/, "seite=0");
        if (!allTag.href.includes("seite=0")) {
            allTag.href += "&seite=0";
        }
        if (document.URL.includes("lang=en")) {
            allTag.textContent = "All";
        } else {
            allTag.textContent = "Alle";
        }
        var childArr = pagination.childNodes;
        if (childArr != null && childArr.length != 0) {
            childArr[0].appendChild(allTag);
        }
    });
}