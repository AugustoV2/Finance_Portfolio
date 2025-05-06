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
} from "recharts"

interface PortfolioChartProps {
  data: Stock[]
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
]

export function PortfolioChart({ data }: PortfolioChartProps) {
  const [chartType, setChartType] = useState<"allocation" | "performance" | "sector">("allocation")

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
          <div className="bg-white p-2 border rounded shadow-sm">
            <p className="font-medium">{payload[0].name}</p>
            <p>{`${payload[0].value.toFixed(2)}%`}</p>
          </div>
        )
      } else if (chartType === "sector") {
        const totalInvestment = data.reduce((sum, stock) => sum + stock.investment, 0)
        const percentage = (payload[0].value / totalInvestment) * 100
        return (
          <div className="bg-white p-2 border rounded shadow-sm">
            <p className="font-medium">{payload[0].name}</p>
            <p>{`${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(payload[0].value)}`}</p>
            <p>{`${percentage.toFixed(2)}% of portfolio`}</p>
          </div>
        )
      } else {
        return (
          <div className="bg-white p-2 border rounded shadow-sm">
            <p className="font-medium">{payload[0].payload.name}</p>
            <p>{`Investment: ${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(payload[0].value)}`}</p>
            <p>{`Current Value: ${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(payload[1].value)}`}</p>
            <p className={payload[2].value >= 0 ? "text-green-600" : "text-red-600"}>
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

  return (
    <div className="space-y-4">
      <Tabs value={chartType} onValueChange={(value) => setChartType(value as "allocation" | "performance" | "sector")}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="allocation">Stock Allocation</TabsTrigger>
          <TabsTrigger value="sector">Sector Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
          <Card>
            <CardContent className="p-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
          <Card>
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="investment" name="Investment" fill="#8884d8" />
                    <Bar dataKey="currentValue" name="Current Value" fill="#82ca9d" />
                    <Bar dataKey="gainLoss" name="Gain/Loss" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
