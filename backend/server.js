require("dotenv").config();
const http = require("http");
const { title } = require("process");
const { json } = require("stream/consumers");
const API_KEY = process.env.CONGRESS_API_KEY;

const server = http.createServer(async(req, res) => {
    console.log("Request received:", req.url);

    const url = new URL(req.url, "http://localhost:3000");

    

    if(url.pathname === "/api/bill"){
        
        const congress = url.searchParams.get("congress");
        const type = url.searchParams.get("type");
        const number = url.searchParams.get("number");

        let billData;
        let summaryData;
        
        try{
            //get basic bill info
            const billResponse = await fetch(
                `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?api_key=${API_KEY}`
            );

            billData = await billResponse.json();
            console.log("recived bill data");

        }catch (err){ 
            res.writeHead(500, {
                "Content-Type": "application/json" 
            });

            res.end(JSON.stringify({
                error: "Unable to fetch bill."
            }));

            return;
        }
     


       
        if(!billData.bill) {
                res.writeHead(404, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });
                res.end(JSON.stringify({
                    error: "Bill not found."
                }));
                return;
            }

            console.log("Received data");

            const billsInfo ={
                title: billData.bill.title,
                type: billData.bill.type,
                number: billData.bill.number,
                policyArea: billData.bill.policyArea?.name,
                originChamber: billData.bill.originChamber,
                introducedDate: billData.bill.introducedDate,
                sponsors: billData.bill.sponsors[0]?.fullName,
                //summary: summaryData.text

               
        
            };
            //console.log(billsInfo);
           // console.log(data.bill.sponsors);
            //console.log(summary);


            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
            
            console.log("billsInfo");

            res.end(JSON.stringify(billsInfo));
            console.log(billsInfo);

        
        return;
    } 
    res.writeHead(404);
    res.end("Not Found");

});

server.listen(3000, () => {
    console.log("Server running on port 3000")
})

