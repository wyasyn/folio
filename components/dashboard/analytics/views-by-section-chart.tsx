"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { SectionViewRow } from "@/lib/dashboard/analytics-data"

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

type ViewsBySectionChartProps = {
  data: SectionViewRow[]
}

export function ViewsBySectionChart({ data }: ViewsBySectionChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Views by section</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No views recorded yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <BarChart accessibilityLayer data={data} margin={{ left: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="section"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="views"
                fill="var(--color-views)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
