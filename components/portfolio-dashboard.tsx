"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { PortfolioTable } from "@/components/portfolio-table"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { PortfolioChart } from "@/components/portfolio-chart"
import {
  fetchPortfolioData,
  updateStockPrices
} from "@/lib/portfolio-service"
import type { Stock } from "@/lib/types"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  RefreshCcw,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StockTicker } from "@/components/stock-ticker"
import { motion } from "framer-motion"

const UPDATE_INTERVAL = 15000

export function PortfolioDashboard() {
  const [portfolioData, setPortfolioData] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(UPDATE_INTERVAL / 1000)
  const [previousGainLoss, setPreviousGainLoss] = useState<number>(0)
  const [activeTab, setActiveTab] = useState("table")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchPortfolioData()
      setPortfolioData(data)
      setLastUpdated(new Date())
      const totalGainLoss = data.reduce((sum, stock) => sum + stock.gainLoss, 0)
      setPreviousGainLoss(totalGainLoss)
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      const updatedData = await updateStockPrices()
      setPortfolioData(updatedData)
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

  const totalGainLoss = portfolioData.reduce((sum, stock) => sum + stock.gainLoss, 0)
  const isPositiveReturn = totalGainLoss >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/30">
        <StockTicker stocks={portfolioData} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Next update in: {nextUpdateIn}s
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-gray-700/30">
            {isPositiveReturn ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositiveReturn
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
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

      <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 p-1 rounded-xl">
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

        <TabsContent value="table" className="mt-4">
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle>Portfolio Holdings</CardTitle>
                <CardDescription>
                  View your current stock holdings and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioTable data={portfolioData} isLoading={isLoading} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle>Portfolio Visualization</CardTitle>
                <CardDescription>
                  Visual breakdown of your portfolio allocation and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioChart data={portfolioData} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
