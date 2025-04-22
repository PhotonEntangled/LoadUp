import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import 'mapbox-gl/dist/mapbox-gl.css';
import MainLayout from "@/components/main-layout"
import { Providers } from "@/components/providers"
import { SimulationStoreProvider } from '@/lib/context/SimulationStoreContext';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LoadUp Admin",
  description: "LoadUp Logistics Management Platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} bg-background text-foreground h-full overflow-hidden`}>
        <Providers>
          <SimulationStoreProvider>
            <MainLayout>{children}</MainLayout>
          </SimulationStoreProvider>
        </Providers>
      </body>
    </html>
  )
} 