import { Suspense } from "react"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"
import { PortfolioSkeleton } from "@/components/portfolio-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-transparent bg-clip-text dark:from-purple-400 dark:via-pink-300 dark:to-orange-300">
              Investment Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Track your investments with real-time updates and insights
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Suspense fallback={<PortfolioSkeleton />}>
          <PortfolioDashboard />
        </Suspense>
      </div>
    </main>
  )
}
