async function loadBills() {

    const response = await fetch(
        "http://localhost:3000/api/bills"
    );

    const bills = await response.json();

    console.log(bills);

}

loadBills();