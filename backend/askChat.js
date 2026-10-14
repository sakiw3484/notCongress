require("dotenv").config();
console.log(process.env.apiKey ? "API key found" : "API key NOT found");

const OpenAI = require("openai");
const client = new OpenAI();
//const API_KEY = process.env.OPENAI_API_KEY;


async function main(){
    const response = await client.responses.create({
        model: "gpt-5.6",
        input: "explain ", 
      });
      
      console.log(response.output_text);

}
main();


