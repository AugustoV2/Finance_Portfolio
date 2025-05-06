export interface Stock {
  id: string
  name: string
  purchasePrice: number
  quantity: number
  investment: number
  exchange: string
  currentPrice: number
  presentValue: number
  gainLoss: number
  peRatio: number
  latestEarnings: number
  portfolioPercentage: number
  sector: string
}

export interface SectorSummary {
  sector: string
  totalInvestment: number
  totalPresentValue: number
  totalGainLoss: number
  stocks: Stock[]
}
