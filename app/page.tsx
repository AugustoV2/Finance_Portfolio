import { Suspense } from "react"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"
import { PortfolioSkeleton } from "@/components/portfolio-skeleton"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Investment Portfolio Dashboard</h1>
        <Suspense fallback={<PortfolioSkeleton />}>
          <PortfolioDashboard />
        </Suspense>
      </div>
    </main>
  )
}
