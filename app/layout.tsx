import type React from "react"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={null}>
            {children}
          
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
