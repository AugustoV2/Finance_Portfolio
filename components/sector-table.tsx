"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { SectorSummary } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface SectorTableProps {
  sectorSummaries: SectorSummary[]
  isLoading: boolean
}

export function SectorTable({ sectorSummaries, isLoading }: SectorTableProps) {
  // Ensure sectorSummaries is an array
  const summaries = Array.isArray(sectorSummaries) ? sectorSummaries : []

  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>(() => {
    // Initialize all sectors as open
    const initialState: Record<string, boolean> = {}
    summaries.forEach((summary) => {
      initialState[summary.sector] = true
    })
    return initialState
  })

  const toggleSector = (sector: string) => {
    setOpenSectors((prev) => ({
      ...prev,
      [sector]: !prev[sector],
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg"
          >
            <CardContent className="p-4">
              <Skeleton className="h-12 w-full" />
              <div className="mt-2 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // If there are no sectors to display
  if (summaries.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No sector data available. Please refresh the page or try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary, index) => (
        <motion.div
          key={summary.sector}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible open={openSectors[summary.sector] || false} onOpenChange={() => toggleSector(summary.sector)}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: openSectors[summary.sector] ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {openSectors[summary.sector] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </motion.div>
                    <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text dark:from-purple-400 dark:to-blue-300">
                      {summary.sector}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {summary.stocks.length} stocks
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Investment</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: summary.stocks[0]?.currency || "INR",
                          maximumFractionDigits: 0,
                        }).format(summary.totalInvestment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: summary.stocks[0]?.currency || "INR",
                          maximumFractionDigits: 0,
                        }).format(summary.totalPresentValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gain/Loss</p>
                      <p
                        className={`font-medium ${summary.totalGainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: summary.stocks[0]?.currency || "INR",
                          maximumFractionDigits: 0,
                        }).format(summary.totalGainLoss)}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <AnimatePresence>
                {openSectors[summary.sector] && (
                  <CollapsibleContent forceMount>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="p-0">
                        <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                              <TableRow>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Purchase Price</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Investment</TableHead>
                                <TableHead className="text-center">Exchange</TableHead>
                                <TableHead className="text-right">CMP</TableHead>
                                <TableHead className="text-right">Present Value</TableHead>
                                <TableHead className="text-right">Gain/Loss</TableHead>
                                <TableHead className="text-right">P/E Ratio</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {summary.stocks.map((stock, stockIndex) => (
                                <TableRow
                                  key={stock.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                                >
                                  <TableCell className="font-medium">
                                    {stock.name}
                                    <div className="text-xs text-gray-500">{stock.symbol}</div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: stock.currency,
                                    }).format(stock.purchasePrice)}
                                  </TableCell>
                                  <TableCell className="text-right">{stock.quantity}</TableCell>
                                  <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: stock.currency,
                                    }).format(stock.investment)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                                      {stock.exchange}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <span className="font-mono">
                                        {new Intl.NumberFormat("en-IN", {
                                          style: "currency",
                                          currency: stock.currency,
                                        }).format(stock.currentPrice)}
                                      </span>
                                      <span
                                        className={`text-xs ${stock.dayChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                      >
                                        ({stock.dayChange.toFixed(2)}%)
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: stock.currency,
                                    }).format(stock.presentValue)}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right ${stock.gainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                  >
                                    {new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: stock.currency,
                                    }).format(stock.gainLoss)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {stock.peRatio ? stock.peRatio.toFixed(2) : "N/A"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
