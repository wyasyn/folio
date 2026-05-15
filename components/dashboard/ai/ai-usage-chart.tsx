"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import type { DailyAiUsage } from "@/lib/dashboard/ai-usage-data"

const chartConfig = {
  requests: {
    label: "Requests",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

type AiUsageChartProps = {
  data: DailyAiUsage[]
  monthRequests: number
  monthTokens: number
}

export function AiUsageChart({
  data,
  monthRequests,
  monthTokens,
}: AiUsageChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-base">Usage (30 days)</CardTitle>
          <CardDescription>Daily chat requests on the portfolio</CardDescription>
        </div>
        <CardAction>
          <div className="text-right text-xs tabular-nums text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                {monthRequests.toLocaleString()}
              </span>{" "}
              req ·{" "}
              <span className="font-medium text-foreground">
                {monthTokens.toLocaleString()}
              </span>{" "}
              tokens
            </p>
            <p>this month</p>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 11 }}
            />
            <YAxis tickLine={false} axisLine={false} width={28} tick={{ fontSize: 11 }} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "requests") {
                      return [value, "Requests"]
                    }
                    return [value, name]
                  }}
                />
              }
            />
            <Bar
              dataKey="requests"
              fill="var(--color-requests)"
              radius={3}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
