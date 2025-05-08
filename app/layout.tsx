import type React from "react"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata = {
  title: "Investment Portfolio Dashboard",
  description: "Track your investments with real-time updates from Yahoo Finance",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={null}>
            {children}
            <Toaster />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
