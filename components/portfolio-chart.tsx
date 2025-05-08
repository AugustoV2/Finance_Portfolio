"use client"

import { useState } from "react"
import type { Stock } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Sector,
} from "recharts"
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
  const [activeIndex, setActiveIndex] = useState(0)

  // Prepare data for allocation chart (pie chart)
  const allocationData = data.map((stock) => ({
    name: stock.name,
    value: stock.portfolioPercentage,
  }))

  // Prepare data for performance chart (bar chart)
  const performanceData = data.map((stock) => ({
    name: stock.name,
    investment: stock.investment,
    currentValue: stock.presentValue,
    gainLoss: stock.gainLoss,
  }))

  // Prepare data for sector chart (pie chart)
  const sectorData = data.reduce(
    (acc, stock) => {
      const existingSector = acc.find((item) => item.name === stock.sector)
      if (existingSector) {
        existingSector.value += stock.investment
      } else {
        acc.push({
          name: stock.sector,
          value: stock.investment,
        })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      if (chartType === "allocation") {
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
            <p className="font-medium text-gray-900 dark:text-gray-100">{payload[0].name}</p>
            <p className="text-gray-600 dark:text-gray-300">{`${payload[0].value.toFixed(2)}%`}</p>
          </div>
        )
      } else if (chartType === "sector") {
        const totalInvestment = data.reduce((sum, stock) => sum + stock.investment, 0)
        const percentage = (payload[0].value / totalInvestment) * 100
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
            <p className="font-medium text-gray-900 dark:text-gray-100">{payload[0].name}</p>
            <p className="text-gray-600 dark:text-gray-300">{`${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(payload[0].value)}`}</p>
            <p className="text-gray-600 dark:text-gray-300">{`${percentage.toFixed(2)}% of portfolio`}</p>
          </div>
        )
      } else {
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
            <p className="font-medium text-gray-900 dark:text-gray-100">{payload[0].payload.name}</p>
            <p className="text-gray-600 dark:text-gray-300">{`Investment: ${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(payload[0].value)}`}</p>
            <p className="text-gray-600 dark:text-gray-300">{`Current Value: ${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(payload[1].value)}`}</p>
            <p
              className={`font-medium ${payload[2].value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {`Gain/Loss: ${new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(payload[2].value)}`}
            </p>
          </div>
        )
      }
    }
    return null
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? "start" : "end"

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={chartType} onValueChange={(value) => setChartType(value as "allocation" | "performance" | "sector")}>
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 p-1 rounded-xl">
          <TabsTrigger
            value="allocation"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300"
          >
            Stock Allocation
          </TabsTrigger>
          <TabsTrigger
            value="sector"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300"
          >
            Sector Allocation
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary rounded-lg transition-all duration-300"
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
              <CardContent className="p-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sector" className="mt-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg">
              <CardContent className="p-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg">
              <CardContent className="p-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="investment"
                        name="Investment"
                        fill="#8884d8"
                        animationBegin={0}
                        animationDuration={1000}
                      />
                      <Bar
                        dataKey="currentValue"
                        name="Current Value"
                        fill="#82ca9d"
                        animationBegin={300}
                        animationDuration={1000}
                      />
                      <Bar
                        dataKey="gainLoss"
                        name="Gain/Loss"
                        fill="#ffc658"
                        animationBegin={600}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  )
}
