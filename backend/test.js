require("dotenv").config();
const API_KEY = process.env.CONGRESS_API_KEY;


const BASE_URL = "https://api.congress.gov/v3";
const congress = "119";
const type = "HR";
const number = "21";

async function testCongressAPI() {

  if ( !API_KEY) {
    console.error("❌ Error: Please provide a valid Congress.gov API key.");
    return;
  }

  
  console.log("🛰️ Fetching data from Congress.gov API...");

  try {
    const response = await fetch(`https://api.congress.gov/v3/bill/${congress}/${type}/${number}?api_key=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }


    const billData = await response.json();
    
    console.log("✅ Success! Response metadata:");
    
    const billsInfo ={
        title: billData.bill.title,
        title: billData.bill.title,
                type: billData.bill.type,
                number: billData.bill.number,
                policyArea: billData.bill.policyArea?.name,
                originChamber: billData.bill.originChamber,
                introducedDate: billData.bill.introducedDate,
                sponsors: billData.bill.sponsors[0]?.fullName,
       
    
    };

    JSON.stringify(billsInfo);
            console.log(billsInfo);
    

  } catch (error) {
    console.error("❌ Test Script Failed:", error.message);
  }
}

testCongressAPI();
