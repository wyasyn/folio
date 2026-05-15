"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"
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
import type { StackSlice } from "@/lib/dashboard/overview-data"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

type ProjectsByStackChartProps = {
  data: StackSlice[]
}

type ChartRow = {
  stackKey: string
  name: string
  count: number
  fill: string
}

function buildChartModel(data: StackSlice[]) {
  const rows: ChartRow[] = data.map((item, index) => {
    const stackKey = `stack${index}`
    return {
      stackKey,
      name: item.name,
      count: item.count,
      fill: `var(--color-${stackKey})`,
    }
  })

  const chartConfig = rows.reduce<ChartConfig>((acc, row, index) => {
    acc[row.stackKey] = {
      label: row.name,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }
    return acc
  }, {})

  return { rows, chartConfig }
}

export function ProjectsByStackChart({ data }: ProjectsByStackChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const { rows, chartConfig } = React.useMemo(
    () => buildChartModel(data),
    [data]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by stack</CardTitle>
        <CardDescription>Published projects per tech stack</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No projects with tech stacks yet.
          </p>
        ) : (
          <div className="relative mx-auto min-h-[300px] w-full max-w-md">
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" />}
                />
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {rows.map((entry) => (
                    <Cell key={entry.stackKey} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {total}
              </span>
              <span className="text-xs text-muted-foreground">Projects</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
