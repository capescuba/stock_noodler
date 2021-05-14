const axios = require("axios");
const fmpApiKey = "f38bdbbfe06bfb07ed86842760b1ec63";
const fmpApiBase = "https://fmpcloud.io/api/v3/";
var rangeMode = false;

//"https://fmpcloud.io/api/v3/quote/WDAY?apikey=f38bdbbfe06bfb07ed86842760b1ec63"
async function getStockQuote(ticker, from, to) {
  var endpoint = fmpApiBase;
  var restMethodName = "quote";
  var quoteDetails = null;

  try {
    if (!ticker) {
      throw new Error("Missing ticker symbol");
    }

    if (from && to) {
      rangeMode = true;
      restMethodName = "historical-price-full";

      endpoint +=
        restMethodName +
        "/" +
        ticker.toUpperCase() +
        "?from=" +
        from +
        "&to=" +
        to +
        "&apikey=" +
        fmpApiKey;
    } else {
      endpoint +=
        restMethodName + "/" + ticker.toUpperCase() + "?apikey=" + fmpApiKey;
    }

    console.info("fmpHandler->endpoint:", endpoint);

    const response = await axios
      .get(endpoint)
      .then(({ data }) => {
        console.info("fmpHandler->data:", data);
        if (rangeMode) {
          quoteDetails = data.historical;
        } else {
          quoteDetails = data[0];
        }
      })
      .catch((error) => {
        console.info("fmpHandler->error:", error);
        return error;
      });

    console.log(response);
    console.info("fmpHandler->quoteDetails:", quoteDetails);
    return quoteDetails;
  } catch (error) {
    console.info("fmpHandler->error:", error);
    return error;
  }
}

module.exports = {
  getStockQuote,
};
