function getFromLocal(storageId) {
    let map = new Map();
    if (localStorage.getItem(storageId)) {
        map = new Map(JSON.parse(localStorage.getItem(storageId)));
    }
    return map;
}

function setLocal(storageId, map) {
    localStorage.setItem(storageId, JSON.stringify(Array.from(map.entries())));
}

function addLoadAndDeleteButton(loadFunction, removeFunction, loadDiv, removeDiv, key) {
    let load = document.createElement('button');
    load.id =  key + "Ext";
    load.type = "submit";
    load.style = "font-weight: inherit; font-size: inherit; color: inherit; background: brightgrey; border: none; border-radius: 0; margin: 1px; padding: 5px;";
    let removeButton = load.cloneNode(false);

    load.textContent = "↺" + key;
    load.onclick = loadFunction;
    loadDiv.appendChild(load);

    removeButton.textContent = "🗑" + key;
    removeButton.onclick = removeFunction;
    removeDiv.appendChild(removeButton);
}
