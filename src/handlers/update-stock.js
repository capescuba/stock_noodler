const axios = require("axios");
const mysql = require("mysql");
const fmpHandler = require("fmpHandler");
const dbHandler = require("dbHandler");
const fmpApiKey = "f38bdbbfe06bfb07ed86842760b1ec63";

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.updateStockHandler = async (event) => {
  
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);
  console.info("ticker:", event.queryStringParameters.ticker);
  console.info("from:", event.queryStringParameters.from);
  console.info("to:", event.queryStringParameters.to);
  const ticker = event.queryStringParameters.ticker;
  const from = event.queryStringParameters.from;
  const to = event.queryStringParameters.to;
  
  var quoteDetails = await fmpHandler.getStockQuote(ticker, from, to);
  
  var rows = await dbHandler.updateStockHistory(ticker, quoteDetails);
  
  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: "Rows updated: " + rows ,
  };
   
  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};

