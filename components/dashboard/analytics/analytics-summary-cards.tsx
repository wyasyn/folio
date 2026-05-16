import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AnalyticsSummary } from "@/lib/dashboard/analytics-data"

type AnalyticsSummaryCardsProps = {
  summary: AnalyticsSummary
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const cards = [
    {
      title: "Views (7 days)",
      value: summary.views7d.toLocaleString(),
      description: "All portfolio pages",
    },
    {
      title: "Views (30 days)",
      value: summary.views30d.toLocaleString(),
      description: "All portfolio pages",
    },
    {
      title: "Sessions (30 days)",
      value: summary.uniqueSessions30d.toLocaleString(),
      description: "Approx. unique visitors",
    },
    {
      title: "Top referrer",
      value: summary.topReferrer ?? "—",
      description: "Last 30 days",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums truncate">
              {card.value}
            </CardTitle>
          </CardHeader>
          <p className="px-6 pb-4 text-xs text-muted-foreground">
            {card.description}
          </p>
        </Card>
      ))}
    </div>
  )
}
