"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import type { Stock } from "@/lib/types"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StockTickerProps {
  stocks: Stock[]
}

export function StockTicker({ stocks }: StockTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [duplicatedStocks, setDuplicatedStocks] = useState<Stock[]>([])

  useEffect(() => {
    if (stocks.length > 0) {
      // Duplicate the stocks array to create a continuous loop
      setDuplicatedStocks([...stocks, ...stocks])
    }
  }, [stocks])

  if (stocks.length === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden h-10" ref={containerRef}>
      <motion.div
        className="flex absolute whitespace-nowrap"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          x: {
            duration: 20,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          },
        }}
      >
        {duplicatedStocks.map((stock, index) => (
          <div key={`${stock.id}-${index}`} className="flex items-center mr-8">
            <span className="font-medium text-gray-800 dark:text-gray-200 mr-2">{stock.name}</span>
            <span
              className={`font-mono ${stock.dayChangeValue >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: stock.currency,
              }).format(stock.currentPrice)}
            </span>
            <span
              className={`ml-1 flex items-center text-xs ${stock.dayChangeValue >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {stock.dayChangeValue >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {(stock.dayChange || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
