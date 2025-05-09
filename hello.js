import yahooFinance from 'yahoo-finance2'; // Make sure your project uses ES modules (type: "module" in package.json)

async function getStockData(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);

    const data = {
      name: quote.displayName || quote.shortName,
      symbol: quote.symbol,
      cmp: quote.regularMarketPrice,
      peRatio: quote.trailingPE,
      currency: quote.currency,
    };

    console.log(data);
  } catch (error) {
    console.error(`Failed to fetch data for ${symbol}:`, error);
  }
}

// Example usage
getStockData('INFY.NS'); // Fetch data for Infosys
getStockData('RELIANCE.NS'); // Fetch data for Reliance
getStockData('TCS.NS'); // Fetch data for TCS
getStockData('HDFCBANK.NS'); // Fetch data for HDFC Bank
getStockData('ICICIBANK.NS'); // Fetch data for ICICI Bank
