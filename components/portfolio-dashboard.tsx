"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioTable } from "@/components/portfolio-table"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { PortfolioChart } from "@/components/portfolio-chart"
import { fetchPortfolioData, updateStockPrices, groupStocksBySector } from "@/lib/portfolio-service"
import type { Stock, SectorSummary } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCcw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectorTable } from "@/components/sector-table"

const UPDATE_INTERVAL = 15000

// ✅ Mock data: replace this with real user portfolio from your backend/db
const initialPortfolio = [
  {
    id: "1",
    name: "AAPL",
    purchasePrice: 150,
    quantity: 10,
    investment: 1500,
    exchange: "NASDAQ",
    sector: "Technology"
  },
  {
    id: "2",
    name: "MSFT",
    purchasePrice: 250,
    quantity: 5,
    investment: 1250,
    exchange: "NASDAQ",
    sector: "Technology"
  },
  {
    id: "3",
    name: "JNJ",
    purchasePrice: 165,
    quantity: 8,
    investment: 1320,
    exchange: "NYSE",
    sector: "Healthcare"
  }
]

export function PortfolioDashboard() {
  const [portfolioData, setPortfolioData] = useState<Stock[]>([])
  const [sectorSummaries, setSectorSummaries] = useState<SectorSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(UPDATE_INTERVAL / 1000)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchPortfolioData(initialPortfolio)
      setPortfolioData(data)
      const sectors = await groupStocksBySector(data)
      setSectorSummaries(sectors)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error)
      setPortfolioData([])
      setSectorSummaries([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      const updatedData = await updateStockPrices(initialPortfolio)
      setPortfolioData(updatedData)
      const sectors = await groupStocksBySector(updatedData)
      setSectorSummaries(sectors)
      setLastUpdated(new Date())
      setNextUpdateIn(UPDATE_INTERVAL / 1000)
    } catch (error) {
      console.error("Failed to update stock prices:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    loadData()
    const intervalId = setInterval(updateData, UPDATE_INTERVAL)
    const countdownId = setInterval(() => {
      setNextUpdateIn((prev) => (prev > 0 ? prev - 1 : UPDATE_INTERVAL / 1000))
    }, 1000)
    return () => {
      clearInterval(intervalId)
      clearInterval(countdownId)
    }
  }, [])

  const handleRefresh = () => {
    updateData()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Next update in: {nextUpdateIn}s</span>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={isLoading || isUpdating}
        >
          <RefreshCcw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
          {isUpdating ? "Updating..." : "Refresh Now"}
        </Button>
      </div>

      <PortfolioSummary data={portfolioData} isLoading={isLoading} />

      <Tabs defaultValue="sectors" className="w-full">
        <TabsList>
          <TabsTrigger value="sectors">Sector View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>

        <TabsContent value="sectors" className="mt-4">
          <SectorTable sectorSummaries={sectorSummaries} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Holdings</CardTitle>
              <CardDescription>View your current stock holdings and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioTable data={portfolioData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Visualization</CardTitle>
              <CardDescription>Visual breakdown of your portfolio allocation and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioChart data={portfolioData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
