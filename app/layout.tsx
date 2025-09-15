import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "PathQuest",
  description: "A Pathfinding Algorithm Visualizer",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-white text-black font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
