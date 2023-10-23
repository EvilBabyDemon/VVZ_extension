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

function saveState(event) {
    if (localStorage.autofiller && localStorage.autofiller == "false") {
        return;
    }
    var storage = event.target.id + "Ext";
    var tar = event.currentTarget;
    localStorage.setItem(storage, tar.options[tar.selectedIndex].text);
}
const searchFields = ["studiengangTyp", "deptId", "studiengangAbschnittId", "bereichAbschnittId", "unterbereichAbschnittId"];
function addListener() {
    for (let id of searchFields) {
        let elem = document.getElementById(id);
        if (elem != null) {
            elem.addEventListener("change", saveState);
        }
    }
}

function saveFillFeature() {
    const contentMain = document.getElementById("contentMain");
    let inside = contentMain.getElementsByClassName("inside");
    if (inside.length == 0) {
        return;
    }
    let customBottom = document.createElement("div");
    customBottom.id = "customreview-bottom";
    customBottom.style.fontSize = "12px";
    inside[0].appendChild(customBottom);

    const fillExt = "fillExt";
    let saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.style = ethBlueButtonStyle;
    saveButton.style.position = "relative";
    saveButton.style.left = "45%";
    saveButton.style.marginBottom = "5px";

    saveButton.onclick = function () {
        let save = [];
        for (field of searchFields) {
            let elem = document.getElementById(field);
            if (elem != null) {
                let storage = field + "Ext";
                save.push([storage, elem.options[elem.selectedIndex].text]);
            }
        }
        let name = prompt();
        if (name == null) {
            return;
        }
        let storage = getFromLocal(fillExt);
        storage.set(name, save);
        setLocal(fillExt, storage);
        location.reload();
    }
    customBottom.appendChild(saveButton);

    let fillMaps = getFromLocal(fillExt);

    let loadDiv = document.createElement("div");
    let removeDiv = document.createElement("div");

    function loadFill(event) {
        let key = event.target.id;
        key = key.substring(0, key.length - 3);
        let saved = getFromLocal("fillExt");
        let savedMap = saved.get(key);
        for (let field of searchFields) {
            localStorage.removeItem(field + "Ext");
        }
        for (let entry of savedMap) {
            localStorage.setItem(entry[0], entry[1]);
        }
        let reset = document.getElementById("reset");
        reset.click();
    }
    function removeFill(event) {
        let key = event.target.id;
        key = key.substring(0, key.length - 3);
        let saved = getFromLocal("fillExt");
        saved.delete(key);
        setLocal("fillExt", saved);
        location.reload();
    }

    if(fillMaps.size > 0) {
        for (let key of fillMaps.keys()) {
            addLoadAndDeleteButton(loadFill, removeFill, loadDiv, removeDiv, key);
        }
    }
    customBottom.appendChild(loadDiv);
    customBottom.appendChild(removeDiv);
}

async function keepField(id, waitField) {
    var field = document.getElementById(id);
    var storage = id + "Ext";
    if (field == null) {
        return false;
    }

    const fieldsel = [...field.children].filter(element => {
        return element.selected;
    })[0];

    if (fieldsel.textContent == "" && localStorage.getItem(storage)) {
        for (var child of field.children) {
            if (child.textContent == localStorage.getItem(storage)) {
                child.selected = true;
                if (waitField != "") {
                    showWait(waitField);
                    await new Promise(r => setTimeout(r, 350));
                    autoSubmit('sucheLehrangebot');
                }
                return true;
            }
        }
    }
    return false;
}

async function keepSearch() {
    addListener();
    if (localStorage.autofiller && localStorage.autofiller == "false") {
        return;
    }
    var stud = await keepField("studiengangTyp", "");
    var deptId = await keepField("deptId", "");
    if (stud || deptId) {
        showWait("waitSemester");
        await new Promise(r => setTimeout(r, 300));
        autoSubmit('sucheLehrangebot');
        return;
    }
    if (await keepField("studiengangAbschnittId", "waitStudiengangId")) {
        return;
    }
    if (await keepField("bereichAbschnittId", "waitBereich")) {
        return;
    }
    keepField("unterbereichAbschnittId", "");
}

function addCheckboxAutofill(parent) {
    var id = "autofiller";
    var checkname = "autofiller Structure";
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = checkname;
    if (localStorage.autofiller && localStorage.autofiller == "false") {
        checkbox.checked = false;
    } else {
        checkbox.checked = true;
    }
    checkbox.addEventListener('input', updateValue)
    function updateValue(e) {
        localStorage.autofiller = "" + e.target.checked;
        keepSearch();
    }

    // Create a label for the checkbox
    var label = document.createElement('label');
    label.htmlFor = id;
    label.appendChild(document.createTextNode(checkname));

    // Append the checkbox and label to the webpage
    parent.appendChild(checkbox);
    parent.appendChild(label);
    parent.appendChild(document.createElement('br'));
}