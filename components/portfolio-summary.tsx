import { Card, CardContent } from "@/components/ui/card"
import type { Stock } from "@/lib/types"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Percent, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PortfolioSummaryProps {
  data: Stock[]
  isLoading: boolean
}

export function PortfolioSummary({ data, isLoading }: PortfolioSummaryProps) {
  // Calculate summary metrics
  const totalInvestment = data.reduce((sum, stock) => sum + stock.investment, 0)
  const totalCurrentValue = data.reduce((sum, stock) => sum + stock.presentValue, 0)
  const totalGainLoss = totalCurrentValue - totalInvestment
  const percentageChange = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0

  const isPositiveReturn = totalGainLoss >= 0

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <p className="text-sm font-medium text-gray-500">Total Investment</p>
          </div>
          <p className="text-2xl font-bold mt-2">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(totalInvestment)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <p className="text-sm font-medium text-gray-500">Current Value</p>
          </div>
          <p className="text-2xl font-bold mt-2">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(totalCurrentValue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Percent className="h-5 w-5 text-gray-500" />
            <p className="text-sm font-medium text-gray-500">Total Return</p>
          </div>
          <div className="flex items-center mt-2">
            <p className={`text-2xl font-bold ${isPositiveReturn ? "text-green-600" : "text-red-600"}`}>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(totalGainLoss)}
            </p>
            <div className={`flex items-center ml-2 ${isPositiveReturn ? "text-green-600" : "text-red-600"}`}>
              {isPositiveReturn ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              <span className="text-sm font-medium ml-1">{Math.abs(percentageChange).toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
