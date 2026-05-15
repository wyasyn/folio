import db from "@/lib/db"

export type DailyAiUsage = {
  date: string
  requests: number
  tokens: number
}

export async function loadAiUsageChartData(): Promise<DailyAiUsage[]> {
  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  const logs = await db.chatUsageLog.findMany({
    where: { createdAt: { gte: since } },
    select: {
      createdAt: true,
      totalTokens: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const byDay = new Map<string, { requests: number; tokens: number }>()

  for (let i = 0; i < 30; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, { requests: 0, tokens: 0 })
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10)
    const entry = byDay.get(key)
    if (!entry) continue
    entry.requests += 1
    entry.tokens += log.totalTokens
  }

  return Array.from(byDay.entries()).map(([date, stats]) => ({
    date: new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    requests: stats.requests,
    tokens: stats.tokens,
  }))
}

export async function loadAiUsageSummary() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [monthAgg, totalRequests] = await Promise.all([
    db.chatUsageLog.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { totalTokens: true },
      _count: { id: true },
    }),
    db.chatUsageLog.count(),
  ])

  return {
    monthRequests: monthAgg._count.id,
    monthTokens: monthAgg._sum.totalTokens ?? 0,
    totalRequests,
  }
}
