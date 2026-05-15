import { PortfolioFooter } from "@/components/portfolio/portfolio-footer"
import { PortfolioHeaderShell } from "@/components/portfolio/portfolio-header-shell"

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PortfolioHeaderShell />
      {children}
      <PortfolioFooter />
    </div>
  )
}
