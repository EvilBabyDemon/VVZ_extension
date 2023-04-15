// Function to handle toggle change event
function handleToggleChange(event) {
    var storage = event.originalTarget.id;
    var all = storage == "all";
    localStorage.setItem(storage, document.getElementById(storage).checked);
    if (localStorage.getItem(storage) == "true") {
        if (all) {
            for (storage of checks.slice(1)) {
                document.getElementById(storage).disabled = false;
            }
        }
    } else {
        if (all) {
            for (storage of checks.slice(1)) {
                document.getElementById(storage).disabled = true;
            }
        }
    }
}

var checks = ["all", "crlinks", "rating", "timetable", "autofill", "filter"];

for (id of checks) {
    console.log(document.getElementById(id).checked);
    var toggleState = true;
    if (localStorage.getItem(id) != null) {
        toggleState = localStorage.getItem(id) == "true";
    } else {
        localStorage.setItem(storage, true);
    }
    document.getElementById(id).checked = toggleState;
    document.getElementById(id).addEventListener('change', handleToggleChange);
}
if (localStorage.getItem(checks[0]) != "true") {
    for (storage of checks.slice(1)) {
        document.getElementById(storage).disabled = true;
    }
}

