import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { HealthProvider } from "@/lib/health-context"
import { AuthProvider } from "@/lib/auth-context"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Health Monitoring System",
  description: "Smart Community Health Monitoring and Early Warning System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <HealthProvider>{children}</HealthProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
