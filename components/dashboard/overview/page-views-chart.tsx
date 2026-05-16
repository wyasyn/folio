"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardAction,
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
import type { PageViewsChartData } from "@/lib/dashboard/analytics-data"

const chartConfig = {
  views: {
    label: "Page views",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type PageViewsChartProps = {
  data: PageViewsChartData
}

export function PageViewsChart({ data }: PageViewsChartProps) {
  const { data: chartData, total, subtitle } = data

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="grid gap-1">
          <CardTitle>Page views</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <CardAction>
          <p className="text-2xl font-semibold tabular-nums">
            {total.toLocaleString()}
          </p>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <AreaChart accessibilityLayer data={[...chartData]}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="var(--color-views)"
              fill="var(--color-views)"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: "var(--color-views)", r: 3 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
