"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioTable } from "@/components/portfolio-table"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { PortfolioChart } from "@/components/portfolio-chart"
import { fetchPortfolioData, updateStockPrices, groupStocksBySector } from "@/lib/portfolio-service"
import type { Stock, SectorSummary } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCcw, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectorTable } from "@/components/sector-table"
import { StockTicker } from "@/components/stock-ticker"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Update interval in milliseconds (15 seconds)
const UPDATE_INTERVAL = 15000

export function PortfolioDashboard() {
  // Initialize portfolioData as an empty array
  const [portfolioData, setPortfolioData] = useState<Stock[]>([])
  // Initialize sectorSummaries as an empty array
  const [sectorSummaries, setSectorSummaries] = useState<SectorSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(UPDATE_INTERVAL / 1000)
  const [previousGainLoss, setPreviousGainLoss] = useState<number>(0)
  const [activeTab, setActiveTab] = useState("sectors")
  const [usingMockData, setUsingMockData] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchPortfolioData()
      setPortfolioData(data)
      // Make sure we're passing an array to groupStocksBySector
      if (Array.isArray(data)) {
        const sectors = groupStocksBySector(data)
        setSectorSummaries(sectors)
      }
      setLastUpdated(new Date())

      // Calculate total gain/loss
      const totalGainLoss = data.reduce((sum, stock) => sum + stock.gainLoss, 0)
      setPreviousGainLoss(totalGainLoss)

      toast({
        title: "Data loaded successfully",
        description: "Portfolio data has been updated with the latest simulated market prices.",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error)
      toast({
        title: "Error loading data",
        description: "Could not fetch portfolio data. Using cached data if available.",
        variant: "destructive",
      })
      // Don't clear the data if there was an error, keep the previous data if available
      if (portfolioData.length === 0) {
        // Only set empty arrays if there's no existing data
        setPortfolioData([])
        setSectorSummaries([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const updatedData = await updateStockPrices()

      // Calculate new total gain/loss
      const newTotalGainLoss = updatedData.reduce((sum, stock) => sum + stock.gainLoss, 0)
      const previousTotal = previousGainLoss

      setPortfolioData(updatedData)
      // Make sure we're passing an array to groupStocksBySector
      if (Array.isArray(updatedData)) {
        const sectors = groupStocksBySector(updatedData)
        setSectorSummaries(sectors)
      }
      setLastUpdated(new Date())
      setNextUpdateIn(UPDATE_INTERVAL / 1000)

      // Check if gain/loss improved significantly
      if (newTotalGainLoss > previousTotal && newTotalGainLoss > 0 && newTotalGainLoss - previousTotal > 5000) {
        // Trigger confetti for significant gains
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })

        toast({
          title: "Portfolio Gain!",
          description: `Your portfolio has gained ${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(newTotalGainLoss - previousTotal)} since last update!`,
          variant: "default",
        })
      }

      setPreviousGainLoss(newTotalGainLoss)
    } catch (error) {
      console.error("Failed to update stock prices:", error)
      toast({
        title: "Update failed",
        description: "Could not update stock prices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    loadData()

    // Set up automatic updates
    const intervalId = setInterval(updateData, UPDATE_INTERVAL)

    // Countdown timer for next update
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

  const totalGainLoss = portfolioData.reduce((sum, stock) => sum + stock.gainLoss, 0)
  const isPositiveReturn = totalGainLoss >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Toaster />

      {usingMockData && (
        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-4 rounded-lg flex items-center gap-3 shadow-md border border-amber-200 dark:border-amber-800/50">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-medium">Using Simulated Data</h3>
            <p className="text-sm">
              Due to Yahoo Finance API integration issues, we're currently using simulated market data. The prices and
              metrics shown are randomly generated for demonstration purposes.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/30">
        <StockTicker stocks={portfolioData} />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-gray-700/30">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-gray-700/30">
            <div className="relative">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Next update in: {nextUpdateIn}s</span>
          </div>

          <div className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-gray-700/30">
            {isPositiveReturn ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${isPositiveReturn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {isPositiveReturn ? "Trending Up" : "Trending Down"}
            </span>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-white/20 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
          disabled={isLoading || isUpdating}
        >
          <RefreshCcw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
          {isUpdating ? "Updating..." : "Refresh Now"}
        </Button>
      </div>

      <PortfolioSummary data={portfolioData} isLoading={isLoading} />

      <Tabs defaultValue="sectors" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 p-1 rounded-xl">
          <TabsTrigger
            value="sectors"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300"
          >
            Sector View
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300"
          >
            Table View
          </TabsTrigger>
          <TabsTrigger
            value="chart"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300"
          >
            Chart View
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="sectors" className="mt-4">
              <SectorTable sectorSummaries={sectorSummaries} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="table" className="mt-4">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
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
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle>Portfolio Visualization</CardTitle>
                  <CardDescription>Visual breakdown of your portfolio allocation and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <PortfolioChart data={portfolioData} />
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}
