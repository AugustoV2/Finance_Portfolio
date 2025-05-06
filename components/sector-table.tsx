"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { SectorSummary } from "@/lib/types"

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
          <Card key={index}>
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
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No sector data available. Please refresh the page or try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <Card key={summary.sector} className="overflow-hidden">
          <Collapsible open={openSectors[summary.sector] || false} onOpenChange={() => toggleSector(summary.sector)}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-2">
                  {openSectors[summary.sector] ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <h3 className="text-lg font-medium">{summary.sector}</h3>
                  <span className="text-sm text-gray-500">({summary.stocks.length} stocks)</span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Investment</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(summary.totalInvestment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(summary.totalPresentValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gain/Loss</p>
                    <p className={`font-medium ${summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(summary.totalGainLoss)}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
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
                      {summary.stocks.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">{stock.name}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(stock.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right">{stock.quantity}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(stock.investment)}
                          </TableCell>
                          <TableCell className="text-center">{stock.exchange}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(stock.currentPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(stock.presentValue)}
                          </TableCell>
                          <TableCell
                            className={`text-right ${stock.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(stock.gainLoss)}
                          </TableCell>
                          <TableCell className="text-right">{stock.peRatio.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  )
}
