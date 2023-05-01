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

function addListener() {
    for (id of ["studiengangTyp", "deptId", "studiengangAbschnittId", "bereichAbschnittId", "unterbereichAbschnittId"]) {
        var elem = document.getElementById(id);
        if (elem != null) {
            elem.addEventListener("change", saveState);
        }
    }
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
                    await new Promise(r => setTimeout(r, 300));
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

function addCheckboxAutofill() {
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
    document.getElementById("customreview").appendChild(checkbox);
    document.getElementById("customreview").appendChild(label);
    document.getElementById("customreview").appendChild(document.createElement('br'));
}