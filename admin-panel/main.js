const backendUrl = localStorage.getItem("base-url") ?? "https://api.pokerbot.dk";
const apiKey = localStorage.getItem("api-key");

async function loadTables() {
    const resp = await fetch(backendUrl + "/files", {
        method: "GET",
        headers: {
            "X-API-KEY": apiKey
        }
    })
    const errorContainer = document.getElementById("errorMessage")
    errorContainer.innerHTML = ""
    
    if (resp.status != 200) {
        errorContainer.textContent = await resp.text()
    }
    const tables = await resp.json()
    const tableContainer = document.getElementById("tables")
    tableContainer.innerHTML = ""
    for (const tableName in tables) {
        const tableDiv = makeTableDiv(tables[tableName], tableName);
        tableContainer.appendChild(tableDiv)
    }
}

function makeElement(type, className = "", text = "", onclick = null) {
    const el = document.createElement(type)
    el.textContent = text
    el.className = className
    if (onclick) el.onclick = onclick
    return el
}

function appendChildList(parent, children) {
    for (const child of children) {
        parent.appendChild(child)
    }
}

function makeTableDiv(table, tableName) {
    // Base elements
    const tableDiv = makeElement("div", "table");
    const nameH2 = makeElement("h2", "", "Table: " + tableName);
    const headerBox = makeElement("div", "headerBox")
    const runButton = makeElement("button", "", "Run", () => runTable(tableName))
    headerBox.appendChild(nameH2)
    headerBox.appendChild(runButton)


    let resultFileName = "none";
    const filesList = makeElement("ul", "filesList");
    // Add players
    for (const filename of table) {
        if (filename.endsWith(".json")) {
            resultFileName = filename;
            continue;
        }
        let el = makeElement("li", "file")
        let nameEl = makeElement("p", "", filename)
        let buttonDiv = makeElement("div", "buttonDiv")
        let moveBtn = makeElement("button", "", "Move", () => popup(tableName, filename))
        let deleteBtn = makeElement("button", "", "Delete", () => deleteFile(tableName, filename))
        appendChildList(buttonDiv, [moveBtn, deleteBtn])
        appendChildList(el, [nameEl, buttonDiv])
        filesList.appendChild(el)

    };
    const results = makeElement("ul", "resultSelection");
    const resultFile = makeElement("li", "", "Result File: " + resultFileName)
    const deleteResultBtn = makeElement("button", "", "Delete Result File", () => deleteFile(tableName, `table-${tableName}.json`))

    appendChildList(results, [resultFile, deleteResultBtn])
    appendChildList(tableDiv, [headerBox, filesList, results])
    return tableDiv;
}

// Popup that asks for table number to move file to another table
function popup(fromTable, fileName) {
    let toTable = prompt("Please enter table number", "###").toLowerCase()
    if (toTable != null && isNumber(toTable)) {
        moveFile(fromTable, toTable, fileName)
    } else {
        alert("Invalid table number not a number")
    }
}

function isNumber(n) {
    return !isNaN(parseInt(n)) && !isNaN(n - 0)
}

async function moveFile(fromTable, toTable, fileName) {
    await fetch(`${backendUrl}/move/${fromTable}/${fileName}/${toTable}`, {
        method: "PUT",
        headers: {
            "X-API-KEY": apiKey
        }
    })
    loadTables()
}

async function deleteFile(tableName, fileName) {
    var confirmDelete = confirm(`Are you sure you want to delete ${fileName} from ${tableName}?`)
    if (!confirmDelete) return
    await fetch(`${backendUrl}/delete/${tableName}/${fileName}`, {
        method: "Delete",
        headers: {
            "X-API-KEY": apiKey
        }
    })
    loadTables()
}

async function setTime() {
    const time = document.getElementById("timeInputField").value
    await fetch(`${backendUrl}/set-time?time=${time}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            "X-API-KEY": apiKey
        },
    })
    document.getElementById("timeInputField").value = ""
    getTime()
}

async function getTime() {
    const timeField = document.getElementById("currentTime")

    const resp = await fetch(`${backendUrl}/get-time`)
    const time = await resp.text()
    timeField.textContent = "Time: " + time
}

async function runTable(tableName, numberOfWinners = 1) {
    const winnersPrTable = document.getElementById('winnersInputField').value || numberOfWinners
    await fetch(`${backendUrl}/run/${tableName}/${winnersPrTable}`, {
        method: "GET",
        headers: {
            "X-API-KEY": apiKey
        }
    })
    loadTables()
}

getTime()
loadTables()
