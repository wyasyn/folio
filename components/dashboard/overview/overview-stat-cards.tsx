import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { StatCardData } from "@/lib/dashboard/overview-data"

type OverviewStatCardsProps = {
  cards: StatCardData[]
}

export function OverviewStatCards({ cards }: OverviewStatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} size="sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <p className="text-2xl font-semibold tabular-nums">{card.value}</p>
            <p
              className={cn(
                "mt-1 text-xs",
                card.positive === true && "text-emerald-500",
                card.positive === false && "text-muted-foreground",
                card.positive === null && "text-muted-foreground"
              )}
            >
              {card.detail}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
