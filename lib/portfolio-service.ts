  "use server"

  import yahooFinance from "yahoo-finance2"
  import type { Stock, SectorSummary } from "./types"

  // Fetch live stock data for provided stock list
  export async function fetchPortfolioData(
    portfolioInput: {
      id: string
      name: string
      purchasePrice: number
      quantity: number
      investment: number
      exchange: string
      sector: string
    }[]
  ): Promise<Stock[]> {
    const stockData: Stock[] = []

    for (const item of portfolioInput) {
      try {
        const quote = await yahooFinance.quote(item.name)

        const currentPrice = quote.regularMarketPrice || 0
        const presentValue = currentPrice * item.quantity
        const gainLoss = presentValue - item.investment
        const peRatio = quote.trailingPE ?? 0
        const latestEarnings = quote.epsTrailingTwelveMonths && quote.sharesOutstanding
          ? quote.epsTrailingTwelveMonths * quote.sharesOutstanding
          : 0

        stockData.push({
          ...item,
          currentPrice,
          presentValue,
          gainLoss,
          peRatio,
          latestEarnings,
          portfolioPercentage: 0, // Will be updated next
        })
      } catch (error) {
        console.error(`Error fetching quote for ${item.name}:`, error)
      }
    }

    const totalInvestment = stockData.reduce((sum, stock) => sum + stock.investment, 0)

    return stockData.map((stock) => ({
      ...stock,
      portfolioPercentage: totalInvestment ? (stock.investment / totalInvestment) * 100 : 0,
    }))
  }

  // Re-fetches updated stock prices for given portfolio
  export async function updateStockPrices(
    portfolioInput: Parameters<typeof fetchPortfolioData>[0]
  ): Promise<Stock[]> {
    return await fetchPortfolioData(portfolioInput)
  }

  // Group stocks by sector
  export async function groupStocksBySector(stocks: Stock[]): Promise<SectorSummary[]> {
    if (!Array.isArray(stocks)) {
      console.error("Expected stocks to be an array, got:", typeof stocks)
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
