function filterShadows() {
    const input = document.getElementById("shadowFilter");
    const filter = input.value.toUpperCase();
    const table = document.querySelector("table");
    const tr = table.querySelectorAll(":scope > tbody > tr");

    for (const i of tr) {
        const td = i.getElementsByTagName("td")[0];
        if (td) {
            const txtVal = td.textContent || td.innerText;

            if (txtVal.toUpperCase().indexOf(filter) > -1) {
                i.style.display = "";
            } else {
                i.style.display = "none";
            }
        }
    }
}

function populateTable() {
    const table = document.querySelector("table > tbody");
    
    shadows.forEach((s) => {
        const row = table.insertRow();
        const nameCell = row.insertCell();
        const name = document.createTextNode(s.name);
        nameCell.appendChild(name);

        const variantsCell = row.insertCell();

        s.info.forEach((i) => {
            const variantsTable = document.createElement("table");
            variantsCell.appendChild(variantsTable);

            for (const r in i.resistances) {
                const resRow = variantsTable.insertRow();
                const resCell = resRow.insertCell();
                const resVal = document.createTextNode(r);
                resCell.style.fontStyle = "italic";
                resCell.appendChild(resVal);

                const elements = resRow.insertCell();
                for (const e of i.resistances[r]) {
                    const elemVal = document.createTextNode(`${e} `);
                    elements.appendChild(elemVal);
                }
            }

            const thead = variantsTable.createTHead();
            const headerRow = thead.insertRow();
            const th = document.createElement("th");
            const val = document.createTextNode(i.variant);
            th.appendChild(val);
            headerRow.appendChild(th);
        });
    });
}

(function() {
    populateTable();
})();