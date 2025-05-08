"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Stock } from "@/lib/types"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Percent, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

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

  // Get currency from first stock or default to INR
  const currency = data.length > 0 ? data[0].currency : "INR"

  const isPositiveReturn = totalGainLoss >= 0

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg"
          >
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
        <Card className="bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Investment</p>
            </div>
            <motion.p
              className="text-2xl font-bold mt-2 text-gray-800 dark:text-gray-100"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                maximumFractionDigits: 0,
              }).format(totalInvestment)}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
        <Card className="bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Value</p>
            </div>
            <motion.p
              className="text-2xl font-bold mt-2 text-gray-800 dark:text-gray-100"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                maximumFractionDigits: 0,
              }).format(totalCurrentValue)}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
        <Card
          className={`bg-gradient-to-br ${isPositiveReturn ? "from-green-50/70 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20" : "from-red-50/70 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20"} backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div
                className={`${isPositiveReturn ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"} p-2 rounded-full`}
              >
                <Percent
                  className={`h-5 w-5 ${isPositiveReturn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Return</p>
            </div>
            <div className="flex items-center mt-2">
              <motion.p
                className={`text-2xl font-bold ${isPositiveReturn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: currency,
                  maximumFractionDigits: 0,
                }).format(totalGainLoss)}
              </motion.p>
              <motion.div
                className={`flex items-center ml-2 ${isPositiveReturn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {isPositiveReturn ? (
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </motion.div>
                )}
                <span className="text-sm font-medium ml-1">{Math.abs(percentageChange).toFixed(2)}%</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
