import type { Metadata } from "next"
import { Suspense } from "react"
import { PortfolioAnalytics } from "@/components/analytics/portfolio-analytics"
import { PortfolioFooter } from "@/components/portfolio/portfolio-footer"
import { PortfolioHeaderShell } from "@/components/portfolio/portfolio-header-shell"
import { portfolioOpenGraphDefaults } from "@/lib/seo/metadata"

export const metadata: Metadata = {
  openGraph: portfolioOpenGraphDefaults,
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={null}>
        <PortfolioAnalytics />
      </Suspense>
      <PortfolioHeaderShell />
      {children}
      <PortfolioFooter />
    </div>
  )
}
