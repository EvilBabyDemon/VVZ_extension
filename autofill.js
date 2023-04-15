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

async function keepField(field, storage, waitField) {
    if (field == null) {
        return false;
    }

    const fieldsel = [...field.children].filter(element => {
        return element.selected;
    })[0];

    if (fieldsel.textContent == "") {
        if (localStorage.getItem(storage)) {
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
    } else {
        localStorage.setItem(storage, fieldsel.textContent);
    }
    return false;
}

async function keepSearch() {
    if (localStorage.autofiller && localStorage.autofiller == "false") {
        return;
    }
    var stud = await keepField(document.getElementById("studiengangTyp"), "studiengangTypExt", "");
    var deptId = await keepField(document.getElementById("deptId"), "deptIdExt", "");
    if (stud || deptId) {
        showWait("waitSemester");
        await new Promise(r => setTimeout(r, 300));
        autoSubmit('sucheLehrangebot');
        return;
    }
    if (await keepField(document.getElementById("studiengangAbschnittId"), "studiengangAbschnittIdExt", "waitStudiengangId")) {
        return;
    }
    if (await keepField(document.getElementById("bereichAbschnittId"), "bereichAbschnittIdExt", "waitBereich")) {
        return;
    }
    keepField(document.getElementById("unterbereichAbschnittId"), "unterbereichAbschnittIdExt", "");
}

function addCheckboxautofiller() {
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