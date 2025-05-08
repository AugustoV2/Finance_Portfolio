"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import type { Stock } from "@/lib/types"
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface PortfolioTableProps {
  data: Stock[]
  isLoading: boolean
}

export function PortfolioTable({ data, isLoading }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Stock>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Particulars
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("name")}
          <div className="text-xs text-gray-500">{row.original.symbol}</div>
        </div>
      ),
    },
    {
      accessorKey: "sector",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Sector
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium inline-block">
          {row.getValue("sector")}
        </div>
      ),
    },
    {
      accessorKey: "purchasePrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Purchase Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("purchasePrice"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)
        return <div className="text-right font-mono">{formatted}</div>
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-right font-mono">{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "investment",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Investment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("investment"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)
        return <div className="text-right font-mono">{formatted}</div>
      },
    },
    {
      accessorKey: "portfolioPercentage",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Portfolio (%)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const percentage = Number.parseFloat(row.getValue("portfolioPercentage"))
        return (
          <div className="text-right">
            <div className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-xs font-medium">
              {percentage.toFixed(2)}%
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "exchange",
      header: "Exchange",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
            {row.getValue("exchange")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "currentPrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          CMP
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("currentPrice"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)

        const dayChange = row.original.dayChange

        return (
          <div className="text-right flex items-center justify-end gap-1">
            <span className="font-mono">{formatted}</span>
            <span
              className={`text-xs ${dayChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              ({dayChange.toFixed(2)}%)
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "presentValue",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Present Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("presentValue"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)
        return <div className="text-right font-mono">{formatted}</div>
      },
    },
    {
      accessorKey: "gainLoss",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Gain/Loss
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("gainLoss"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)
        const isPositive = amount >= 0
        return (
          <div className="text-right flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`font-mono ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {formatted}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "peRatio",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          P/E Ratio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("peRatio")
        return <div className="text-right font-mono">{value ? Number(value).toFixed(2) : "N/A"}</div>
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
