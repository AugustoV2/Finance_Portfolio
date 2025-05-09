"use client"

import { useState, useEffect, useRef } from "react"
import type { Stock } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

interface PortfolioChartProps {
  data: Stock[]
}

const COLORS = [
  "#8b5cf6", // purple-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#10b981", // emerald-500
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
]

export function PortfolioChart({ data }: PortfolioChartProps) {
  const [chartType, setChartType] = useState<"allocation" | "performance" | "sector">("allocation")
  const isMobile = useIsMobile()
  const [chartHeight, setChartHeight] = useState(300)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate total investment
  const totalInvestment = data.reduce((sum, stock) => sum + stock.investment, 0)
  const totalCurrentValue = data.reduce((sum, stock) => sum + stock.presentValue, 0)

  // Prepare data for allocation chart (pie chart)
  const allocationData = data.map((stock) => ({
    name: stock.name,
    value: stock.portfolioPercentage,
    investment: stock.investment,
    currentValue: stock.presentValue,
    gainLoss: stock.gainLoss,
  }))

  // Prepare data for sector chart (pie chart)
  const sectorData = data
    .reduce(
      (acc, stock) => {
        const existingSector = acc.find((item) => item.name === stock.sector)
        if (existingSector) {
          existingSector.value += stock.investment
          existingSector.currentValue += stock.presentValue
          existingSector.gainLoss += stock.gainLoss
        } else {
          acc.push({
            name: stock.sector,
            value: stock.investment,
            currentValue: stock.presentValue,
            gainLoss: stock.gainLoss,
            percentage: 0, // Will be calculated below
          })
        }
        return acc
      },
      [] as { name: string; value: number; currentValue: number; gainLoss: number; percentage: number }[],
    )
    .map((sector) => ({
      ...sector,
      percentage: (sector.value / totalInvestment) * 100,
    }))

  // Prepare data for performance chart
  const performanceData = data.map((stock) => ({
    name: stock.name,
    investment: stock.investment,
    currentValue: stock.presentValue,
    gainLoss: stock.gainLoss,
  }))

  useEffect(() => {
    // Set chart height based on container width for better responsiveness
    const updateChartHeight = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        // Set height proportional to width, but with a minimum
        setChartHeight(Math.max(300, width * 0.6))
      }
    }

    // Initial update
    updateChartHeight()

    // Update on resize
    window.addEventListener("resize", updateChartHeight)
    return () => window.removeEventListener("resize", updateChartHeight)
  }, [])

  // Custom pie chart component using SVG
  const SimplePieChart = ({ data, colors }: { data: any[]; colors: string[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let startAngle = 0

    return (
      <div className="flex justify-center items-center">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <g transform="translate(50,50)">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (percentage / 100) * 360
              const endAngle = startAngle + angle

              // Calculate SVG arc path
              const x1 = Math.cos((startAngle * Math.PI) / 180) * 40
              const y1 = Math.sin((startAngle * Math.PI) / 180) * 40
              const x2 = Math.cos((endAngle * Math.PI) / 180) * 40
              const y2 = Math.sin((endAngle * Math.PI) / 180) * 40

              // Determine if the arc should be drawn as a large arc
              const largeArcFlag = angle > 180 ? 1 : 0

              // Create the arc path
              const path = `M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

              // Update the start angle for the next slice
              const currentStartAngle = startAngle
              startAngle = endAngle

              return (
                <path
                  key={index}
                  d={path}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="0.5"
                  data-name={item.name}
                  data-value={item.value}
                >
                  <title>{`${item.name}: ${percentage.toFixed(1)}%`}</title>
                </path>
              )
            })}
          </g>
        </svg>
      </div>
    )
  }

  // Custom bar chart component using div elements
  const SimpleBarChart = ({ data }: { data: any[] }) => {
    // Find the maximum value for scaling
    const maxValue = Math.max(...data.flatMap((item) => [item.investment, item.currentValue, Math.abs(item.gainLoss)]))

    return (
      <div className="space-y-6 mt-4 pb-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="font-medium text-sm">{item.name}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-20 text-xs text-gray-500">Investment</div>
                <div
                  className="h-6 bg-purple-500 rounded-sm text-white text-xs flex items-center px-2"
                  style={{ width: `${(item.investment / maxValue) * 100}%` }}
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.investment)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-xs text-gray-500">Current</div>
                <div
                  className="h-6 bg-green-500 rounded-sm text-white text-xs flex items-center px-2"
                  style={{ width: `${(item.currentValue / maxValue) * 100}%` }}
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.currentValue)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-xs text-gray-500">Gain/Loss</div>
                <div
                  className={`h-6 ${item.gainLoss >= 0 ? "bg-green-600" : "bg-red-500"} rounded-sm text-white text-xs flex items-center px-2`}
                  style={{ width: `${(Math.abs(item.gainLoss) / maxValue) * 100}%` }}
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.gainLoss)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Legend component for pie charts
  const ChartLegend = ({ data, colors }: { data: any[]; colors: string[] }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
            <div className="text-xs sm:text-sm flex-1 truncate">{item.name}</div>
            <div className="text-xs sm:text-sm font-medium">
              {chartType === "allocation"
                ? `${item.value.toFixed(1)}%`
                : new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.value)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Summary component for the top of each chart
  const ChartSummary = () => {
    const totalGainLoss = totalCurrentValue - totalInvestment
    const percentageChange = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0
    const isPositive = totalGainLoss >= 0

    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Investment</div>
          <div className="font-medium">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(totalInvestment)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Value</div>
          <div className="font-medium">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(totalCurrentValue)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Return</div>
          <div
            className={`font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(totalGainLoss)}
            <span className="ml-1 text-sm">
              ({isPositive ? "+" : ""}
              {percentageChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    )
  }

  // No data fallback component
  const NoDataFallback = () => (
    <div className="flex flex-col items-center justify-center h-[200px]">
      <p className="text-gray-500 dark:text-gray-400 text-center">No data available to display chart.</p>
      <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">Please refresh or try again later.</p>
    </div>
  )

  return (
    <div className="space-y-4" ref={containerRef}>
      <Tabs value={chartType} onValueChange={(value) => setChartType(value as "allocation" | "performance" | "sector")}>
        <TabsList className="grid w-full grid-cols-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 p-1 rounded-xl">
          <TabsTrigger
            value="allocation"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300 text-xs sm:text-sm"
          >
            Stock Allocation
          </TabsTrigger>
          <TabsTrigger
            value="sector"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300 text-xs sm:text-sm"
          >
            Sector Allocation
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300 text-xs sm:text-sm"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        <motion.div
          key={chartType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="allocation" className="mt-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                {allocationData.length === 0 ? (
                  <NoDataFallback />
                ) : (
                  <>
                    <ChartSummary />
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-4 text-center">Portfolio Allocation by Stock</h3>
                      <SimplePieChart data={allocationData} colors={COLORS} />
                      <ChartLegend data={allocationData} colors={COLORS} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sector" className="mt-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                {sectorData.length === 0 ? (
                  <NoDataFallback />
                ) : (
                  <>
                    <ChartSummary />
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-4 text-center">Portfolio Allocation by Sector</h3>
                      <SimplePieChart data={sectorData} colors={COLORS} />
                      <ChartLegend
                        data={sectorData.map((sector) => ({
                          ...sector,
                          value: sector.percentage,
                        }))}
                        colors={COLORS}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                {performanceData.length === 0 ? (
                  <NoDataFallback />
                ) : (
                  <>
                    <ChartSummary />
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-4">Stock Performance Comparison</h3>
                      <SimpleBarChart data={performanceData} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  )
}
export default PortfolioChart
  