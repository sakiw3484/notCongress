require("dotenv").config();
const http = require("http");
const API_KEY = process.env.CONGRESS_API_KEY;

const server = http.createServer(async(req, res) => {
    const url = new URL(req.url, "http://localhost:3000");

    if(url.pathname === "/api/bill"){
        
        const congress = url.searchParams.get("congress");
        const type = url.searchParams.get("type");
        const number = url.searchParams.get("number");
        try{
            const response = await fetch(
                `https://api.congress.gov/v3/bill/${congress}/${type}/${number}?api_key=${API_KEY}`
            );
            const data = await response.json();
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
            
            res.end(JSON.stringify(data));

        }catch (err){
            res.writeHead(500, {
                "Content-Type": "application/json" 
            });

            res.end(JSON.stringify({
                error: "Unable to fetch bill."
            }));

        }
        return;
    } 
    res.writeHead(404);
    res.end("Not Found");

});

server.listen(3000, () => {
    console.log("Server running on port 3000")
})