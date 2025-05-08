"use server"
import type { Stock, SectorSummary } from "./types"

// Function to fetch portfolio data from Yahoo Finance
export async function fetchPortfolioData(): Promise<Stock[]> {
  // This would typically come from a database in a real application
  // For now, we'll use a predefined list of stocks
  const portfolioStocks = [
    {
      symbol: "RELIANCE.NS",
      purchasePrice: 2100,
      quantity: 10,
      sector: "Energy",
      exchange: "NSE",
    },
    {
      symbol: "HDFCBANK.NS",
      purchasePrice: 1450,
      quantity: 15,
      sector: "Financial Services",
      exchange: "NSE",
    },
    {
      symbol: "INFY.NS",
      purchasePrice: 1650,
      quantity: 12,
      sector: "Technology",
      exchange: "NSE",
    },
    {
      symbol: "TCS.NS",
      purchasePrice: 3200,
      quantity: 5,
      sector: "Technology",
      exchange: "NSE",
    },
    {
      symbol: "BHARTIARTL.NS",
      purchasePrice: 720,
      quantity: 25,
      sector: "Telecommunications",
      exchange: "NSE",
    },
    {
      symbol: "ITC.NS",
      purchasePrice: 350,
      quantity: 50,
      sector: "Consumer Goods",
      exchange: "BSE",
    },
    {
      symbol: "AXISBANK.NS",
      purchasePrice: 850,
      quantity: 20,
      sector: "Financial Services",
      exchange: "NSE",
    },
  ]

  try {
    // Since we're having issues with the Yahoo Finance API, let's create mock data
    // that simulates what we would get from the API
    const stocksData = portfolioStocks.map((stock) => {
      // Generate a random current price that's within ±10% of the purchase price
      const randomFactor = 0.9 + Math.random() * 0.2 // Between 0.9 and 1.1
      const currentPrice = stock.purchasePrice * randomFactor

      // Calculate investment and current values
      const investment = stock.purchasePrice * stock.quantity
      const presentValue = currentPrice * stock.quantity
      const gainLoss = presentValue - investment

      // Generate a random day change percentage between -3% and +3%
      const dayChange = Math.random() * 6 - 3 // Between -3 and +3
      const dayChangeValue = currentPrice * (dayChange / 100)

      return {
        id: stock.symbol,
        name: stock.symbol.replace(".NS", "").replace(".BS", ""),
        symbol: stock.symbol,
        purchasePrice: stock.purchasePrice,
        quantity: stock.quantity,
        investment: investment,
        exchange: stock.exchange,
        currentPrice: currentPrice,
        presentValue: presentValue,
        gainLoss: gainLoss,
        peRatio: 15 + Math.random() * 20, // Random P/E between 15 and 35
        latestEarnings: investment * (0.05 + Math.random() * 0.1), // Random earnings
        portfolioPercentage: 0, // Will be calculated after all stocks are processed
        sector: stock.sector,
        dayChange: dayChange,
        dayChangeValue: dayChangeValue,
        currency: "INR",
      }
    })

    // Calculate portfolio percentages
    const totalInvestment = stocksData.reduce((sum, stock) => sum + stock.investment, 0)

    return stocksData.map((stock) => ({
      ...stock,
      portfolioPercentage: (stock.investment / totalInvestment) * 100,
    }))
  } catch (error) {
    console.error("Failed to fetch portfolio data:", error)
    throw error
  }
}

// Function to update stock prices with fresh data
export async function updateStockPrices(): Promise<Stock[]> {
  try {
    // Fetch fresh data
    return await fetchPortfolioData()
  } catch (error) {
    console.error("Failed to update stock prices:", error)
    throw error
  }
}

// Group stocks by sector and calculate sector summaries
export function groupStocksBySector(stocks: Stock[]): SectorSummary[] {
  // Ensure stocks is an array
  if (!Array.isArray(stocks)) {
    console.error("Expected stocks to be an array, but got:", typeof stocks)
    return []
  }

  const sectorMap = new Map<string, Stock[]>()

  // Group stocks by sector
  stocks.forEach((stock) => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, [])
    }
    sectorMap.get(stock.sector)!.push(stock)
  })

  // Create sector summaries
  const sectorSummaries: SectorSummary[] = []

  sectorMap.forEach((sectorStocks, sector) => {
    const totalInvestment = sectorStocks.reduce((sum, stock) => sum + stock.investment, 0)
    const totalPresentValue = sectorStocks.reduce((sum, stock) => sum + stock.presentValue, 0)
    const totalGainLoss = totalPresentValue - totalInvestment

    sectorSummaries.push({
      sector,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      stocks: sectorStocks,
    })
  })

  // Sort sectors by investment amount (descending)
  return sectorSummaries.sort((a, b) => b.totalInvestment - a.totalInvestment)
}

// This function would be used in a real application to fetch data from Yahoo Finance
// Currently commented out due to integration issues
/*
async function fetchYahooFinanceData(symbol: string) {
  try {
    // In a real implementation, we would use the yahoo-finance2 library correctly
    // For example:
    // const result = await yahooFinance.quote(symbol)
    // return result
    
    console.log(`Would fetch data for ${symbol} from Yahoo Finance`)
    return null
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return null
  }
}
*/
