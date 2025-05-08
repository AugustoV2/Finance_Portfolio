"use client"

import { useState } from "react"
import type { Stock } from "@/lib/types"
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
  "#8b5cf6", // purple-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#10b981", // emerald-500
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
]

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (active && payload && payload.length) {
    if (chartType === "allocation") {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-bold">{payload[0].payload.name}</p>
          <p className="text-sm">
            Allocation: <span className="font-semibold">{payload[0].value.toFixed(2)}%</span>
          </p>
        </div>
      )
    } else {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-bold">{payload[0].payload.name}</p>
          <p className="text-sm">
            Investment: <span className="font-semibold">₹{payload[0].payload.investment.toLocaleString()}</span>
          </p>
          <p className="text-sm">
            Current Value: <span className="font-semibold">₹{payload[0].payload.currentValue.toLocaleString()}</span>
          </p>
          <p className="text-sm">
            P/L:{" "}
            <span className={`font-semibold ${payload[0].payload.gainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              ₹{payload[0].payload.gainLoss.toLocaleString()}
            </span>
          </p>
        </div>
      )
    }
  }
  return null
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  const [chartType, setChartType] = useState<"allocation" | "performance">("allocation")

  // Prepare data for allocation chart (pie chart)
  const allocationData = data.map((stock) => ({
    name: stock.name,
    value: stock.portfolioPercentage,
    color: COLORS[data.indexOf(stock) % COLORS.length],
  }))

  // Prepare data for performance chart (bar chart)
  const performanceData = data.map((stock) => ({
    name: stock.name,
    investment: stock.investment,
    currentValue: stock.presentValue,
    gainLoss: stock.gainLoss,
    color: COLORS[data.indexOf(stock) % COLORS.length],
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">No data available to display charts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setChartType("allocation")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            chartType === "allocation"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Allocation
        </button>
        <button
          onClick={() => setChartType("performance")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            chartType === "performance"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Performance
        </button>
      </div>

      <div className="h-[400px]">
        {chartType === "allocation" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip chartType="allocation" />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry: any, index) => (
                  <span className="text-sm text-gray-600">{allocationData[index].name}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60, // Extra space for rotated labels
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip chartType="performance" />} />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="center"
                wrapperStyle={{ paddingBottom: 20 }}
              />
              <Bar
                dataKey="investment"
                name="Investment"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="currentValue"
                name="Current Value"
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="gainLoss"
                name="Profit/Loss"
                fill="#ffc658"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        {chartType === "allocation"
          ? "Portfolio allocation by stock value"
          : "Investment vs current value with profit/loss"}
      </div>
    </div>
  )
}