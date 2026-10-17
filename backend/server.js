require("dotenv").config();
const http = require("http");

const API_KEY = process.env.CONGRESS_API_KEY;

const server = http.createServer(async(req, res) => {

    console.log("Request received:", req.url);

    const url = new URL(req.url, "http://localhost:3000");

    
    if (url.pathname === "/api/bill") {
        const congress = url.searchParams.get("congress");
        const type = url.searchParams.get("type");
        const number = url.searchParams.get("number");
    
        // Validate required parameters
        if (!congress || !type || !number) {
            res.writeHead(400, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
    
            res.end(JSON.stringify({
                error: "Missing congress, type, or number parameter."
            }));
            return;
        }
    
        try {
            const billResponse = await fetch(
                `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?api_key=${API_KEY}`
            );
    
            if (!billResponse.ok) {
                console.error("Congress API status:", billResponse.status);
    
                res.writeHead(502, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
    
                res.end(JSON.stringify({
                    error: "Unable to retrieve bill from Congress API."
                }));
                return;
            }
    
            const billData = await billResponse.json();
    
            if (!billData.bill) {
                res.writeHead(404, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
    
                res.end(JSON.stringify({
                    error: "Bill not found."
                }));
                return;
            }
    
            const bill = billData.bill;
    
            const billsInfo = {
                title: bill.title,
                type: bill.type,
                number: bill.number,
                policyArea: bill.policyArea?.name ?? null,
                originChamber: bill.originChamber,
                introducedDate: bill.introducedDate,
                sponsors: bill.sponsors?.[0]?.fullName ?? null
            };
    
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
    
            res.end(JSON.stringify(billsInfo));
            console.log(billsInfo);

    
        } catch (err) {
            console.error("Bill request failed:", err.message);
    
            res.writeHead(500, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
    
            res.end(JSON.stringify({
                error: "Unable to fetch bill."
            }));
        }
    
        return;
    }
});    
    server.listen(3000, () => {
        console.log("Server running on port 3000");
    });
