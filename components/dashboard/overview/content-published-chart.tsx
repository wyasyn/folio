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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlyContent } from "@/lib/dashboard/overview-data"

const chartConfig = {
  posts: {
    label: "Blog",
    color: "var(--chart-1)",
  },
  projects: {
    label: "Projects",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type ContentPublishedChartProps = {
  data: MonthlyContent[]
}

export function ContentPublishedChart({ data }: ContentPublishedChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content published</CardTitle>
        <CardDescription>Blog posts + projects per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="posts"
              fill="var(--color-posts)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="projects"
              fill="var(--color-projects)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
