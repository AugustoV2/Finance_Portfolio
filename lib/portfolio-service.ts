"use server"
import type { Stock, SectorSummary } from "./types"
import yahooFinance from 'yahoo-finance2'

export async function fetchPortfolioData(): Promise<Stock[]> {
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
    // Fetch real-time data for all stocks in parallel
    const stocksData = await Promise.all(portfolioStocks.map(async (stock) => {
      try {
        const quote = await yahooFinance.quote(stock.symbol)
        
        const currentPrice = quote.regularMarketPrice || 0
        const investment = stock.purchasePrice * stock.quantity
        const presentValue = currentPrice * stock.quantity
        const gainLoss = presentValue - investment
        
        // Calculate day change (assuming regularMarketPreviousClose is available)
        const dayChange = quote.regularMarketPreviousClose 
          ? ((currentPrice - quote.regularMarketPreviousClose) / quote.regularMarketPreviousClose) * 100
          : 0
        const dayChangeValue = currentPrice - (quote.regularMarketPreviousClose || currentPrice)

        return {
          id: stock.symbol,
          name: quote.displayName || quote.shortName || stock.symbol.replace(".NS", "").replace(".BS", ""),
          symbol: stock.symbol,
          purchasePrice: stock.purchasePrice,
          quantity: stock.quantity,
          investment: investment,
          exchange: stock.exchange,
          currentPrice: currentPrice,
          presentValue: presentValue,
          gainLoss: gainLoss,
          peRatio: quote.trailingPE || 0,
          latestEarnings: quote.trailingPE || 0,
          portfolioPercentage: 0,
          sector: stock.sector,
          dayChange: dayChange,
          dayChangeValue: dayChangeValue,
          currency: quote.currency || "INR",
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${stock.symbol}:`, error)
        // Return fallback data if API fails
        return {
          id: stock.symbol,
          name: stock.symbol.replace(".NS", "").replace(".BS", ""),
          symbol: stock.symbol,
          purchasePrice: stock.purchasePrice,
          quantity: stock.quantity,
          investment: stock.purchasePrice * stock.quantity,
          exchange: stock.exchange,
          currentPrice: stock.purchasePrice,
          presentValue: stock.purchasePrice * stock.quantity,
          gainLoss: 0,
          peRatio: 0,
          latestEarnings: 0,
          portfolioPercentage: 0,
          sector: stock.sector,
          dayChange: 0,
          dayChangeValue: 0,
          currency: "INR",
        }
      }
    }))

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

export async function updateStockPrices(): Promise<Stock[]> {
  try {
    return await fetchPortfolioData()
  } catch (error) {
    console.error("Failed to update stock prices:", error)
    throw error
  }
}

export async function groupStocksBySector(stocks: Stock[]): Promise<SectorSummary[]> {
  if (!Array.isArray(stocks)) {
    console.error("Expected stocks to be an array, but got:", typeof stocks)
    return []
  }

  const sectorMap = new Map<string, Stock[]>()

  stocks.forEach((stock) => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, [])
    }
    sectorMap.get(stock.sector)!.push(stock)
  })

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

  return sectorSummaries.sort((a, b) => b.totalInvestment - a.totalInvestment)
}