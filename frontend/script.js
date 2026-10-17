async function loadBill() {
    console.log("button pressed");
    const input = document.getElementById('billInput').value.toLowerCase().trim();
    const match = input.match(/(hr|s)(\d+)/); // matches 'hr21' or 's123'
    const container = document.getElementById("results");
    if (!match) {
       alert('Please enter a bill like "hr21" or "s123".');
       return;
   }
   const type = match[1];
   const number = match[2];


    try {
        const response = await fetch(
            `http://localhost:3000/api/bill?congress=119&type=${type}&number=${number}`
        );

        if (!response.ok) {
            throw new Error("Failed to load bill");
        }

        const bill = await response.json();
        //console.log(bill);
        //container.textContent = JSON.stringify(bill,null,2 );

        container.innerHTML += createBillCard(bill);


    } catch (err) {

        console.log(err);

        container.textContent = "Error loading bill.";

    }

}


function getBillProgress(bill) {
    const status = (bill.status || "").toLowerCase();

    // These values must match the status data you retrieve
    // from Congress.gov or your own API processing.
    if (bill.isLaw || status.includes("became law")) {
        return 4;
    }

    if (bill.passedHouse && bill.passedSenate) {
        return 3;
    }

    if (bill.passedHouse || bill.passedSenate) {
        return 2;
    }

    if (bill.introducedDate || status.includes("introduced")) {
        return 1;
    }

    return 0;
}

function createBillTracker(bill) {
    const steps = [
        "Introduced",
        "Committee",
        "Passed",
        "Became law"
    ];

    const progress = getBillProgress(bill);

    return `
        <div class="bill-tracker"
             aria-label="Bill progress">
            ${steps.map((step, index) => `
                <div class="tracker-step
                    ${index < progress ? "complete" : ""}
                    ${index === progress - 1 ? "current" : ""}">
                    <span class="tracker-dot">
                        ${index < progress ? "✓" : index + 1}
                    </span>
                    <span class="tracker-label">${step}</span>
                </div>
            `).join("")}
        </div>
    `;
}

function createBillCard(bill) {
    return `
        <article class="bill-card">
            <div class="bill-meta">
                <span class="bill-id tag">
                    ${bill.type}. ${bill.number}
                </span>
                <span class="tag">${bill.originChamber || "Congress"}</span>
                ${bill.policyArea
                    ? `<span class="tag">${bill.policyArea}</span>`
                    : ""}
            </div>

            <div class="bill-content">
                <h2 class="bill-title">${bill.title}</h2>
                <p class="bill-summary">
                    ${bill.summary || "No summary available yet."}
                </p>
                <p class="bill-sponsor">
                    <strong>Sponsor:</strong>
                    ${bill.sponsors || "Information unavailable"}
                </p>
            </div>

            <div class="bill-progress-section">
                <h3>Progress</h3>
                ${createBillTracker(bill)}
            </div>

            <div class="bill-footer">
                <button class="ai-explainer"
                        data-bill-type="${bill.type}"
                        data-bill-number="${bill.number}">
                    ✨ AI Explainer
                </button>
            </div>
        </article>
    `;
}
