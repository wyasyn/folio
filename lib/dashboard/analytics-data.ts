import type { AnalyticsResourceType } from "@/generated/prisma/client"
import db from "@/lib/db"

export type PageViewsChartData = {
  total: number
  subtitle: string
  data: { month: string; views: number }[]
}

export type TopProjectViewRow = {
  name: string
  views: number
}

export type TopProjectsChartData = {
  subtitle: string
  data: TopProjectViewRow[]
}

export type SiteVisitsKpi = {
  value: string | number
  detail: string
  positive: boolean | null
}

function monthRange(offsetFromCurrent: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offsetFromCurrent, 1)
  const end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
  return { start, end }
}

function formatMoMDelta(current: number, previous: number): {
  detail: string
  positive: boolean | null
} {
  if (previous === 0 && current === 0) {
    return { detail: "No views yet", positive: null }
  }
  if (previous === 0) {
    return { detail: `+${current} this month`, positive: true }
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { detail: "No change vs last month", positive: null }
  if (pct > 0) return { detail: `↑ ${pct}% vs last month`, positive: true }
  return { detail: `↓ ${Math.abs(pct)}% vs last month`, positive: false }
}

function getLast6Months() {
  const months: { label: string; start: Date; end: Date }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )
    months.push({
      label: start.toLocaleString("en-US", { month: "short" }),
      start,
      end,
    })
  }
  return months
}

export async function loadSiteVisitsKpi(): Promise<SiteVisitsKpi> {
  const current = monthRange(0)
  const previous = monthRange(-1)

  const [currentCount, previousCount] = await Promise.all([
    db.pageView.count({
      where: {
        createdAt: { gte: current.start, lte: current.end },
      },
    }),
    db.pageView.count({
      where: {
        createdAt: { gte: previous.start, lte: previous.end },
      },
    }),
  ])

  const delta = formatMoMDelta(currentCount, previousCount)

  return {
    value: currentCount.toLocaleString(),
    detail: delta.detail,
    positive: delta.positive,
  }
}

export async function loadPageViewsChart(): Promise<PageViewsChartData> {
  const months = getLast6Months()
  const rangeStart = months[0]!.start

  const views = await db.pageView.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: { createdAt: true },
  })

  const data = months.map((m) => {
    const count = views.filter(
      (v) => v.createdAt >= m.start && v.createdAt <= m.end
    ).length
    return { month: m.label, views: count }
  })

  const total = views.length
  const hasData = total > 0

  return {
    total,
    subtitle: hasData ? "Last 6 months" : "No views recorded yet",
    data,
  }
}

export async function loadTopProjectsByViews(
  limit = 5
): Promise<TopProjectsChartData> {
  const grouped = await db.pageView.groupBy({
    by: ["slug"],
    where: {
      resourceType: "project",
      slug: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  const slugs = grouped
    .map((g) => g.slug)
    .filter((s): s is string => Boolean(s))

  const projects =
    slugs.length > 0
      ? await db.project.findMany({
          where: { slug: { in: slugs } },
          select: { slug: true, title: true },
        })
      : []

  const titleBySlug = new Map(projects.map((p) => [p.slug, p.title]))

  const data: TopProjectViewRow[] = grouped.map((row) => ({
    name: titleBySlug.get(row.slug ?? "") ?? row.slug ?? "Unknown",
    views: row._count.id,
  }))

  return {
    subtitle:
      data.length > 0
        ? "Published project detail pages"
        : "No project views yet",
    data,
  }
}

export type AnalyticsSummary = {
  views7d: number
  views30d: number
  uniqueSessions30d: number
  topReferrer: string | null
}

export async function loadAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date()
  const since7d = new Date(now)
  since7d.setDate(since7d.getDate() - 7)
  const since30d = new Date(now)
  since30d.setDate(since30d.getDate() - 30)

  const [views7d, views30d, sessions, referrers] = await Promise.all([
    db.pageView.count({ where: { createdAt: { gte: since7d } } }),
    db.pageView.count({ where: { createdAt: { gte: since30d } } }),
    db.pageView.findMany({
      where: { createdAt: { gte: since30d } },
      distinct: ["sessionKey"],
      select: { sessionKey: true },
    }),
    db.pageView.groupBy({
      by: ["referrer"],
      where: {
        createdAt: { gte: since30d },
        referrer: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ])

  return {
    views7d,
    views30d,
    uniqueSessions30d: sessions.length,
    topReferrer: referrers[0]?.referrer ?? null,
  }
}

export type SectionViewRow = {
  section: string
  views: number
}

const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  blog: "Blog",
  blog_post: "Blog posts",
  project: "Projects",
  news: "News",
  news_item: "News articles",
  contact: "Contact",
  uses: "Uses",
  other: "Other",
}

export async function loadViewsBySection(): Promise<SectionViewRow[]> {
  const since30d = new Date()
  since30d.setDate(since30d.getDate() - 30)

  const grouped = await db.pageView.groupBy({
    by: ["resourceType"],
    where: { createdAt: { gte: since30d } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  return grouped.map((row) => ({
    section:
      SECTION_LABELS[row.resourceType] ?? String(row.resourceType),
    views: row._count.id,
  }))
}

export type TopContentRow = {
  title: string
  slug: string
  views: number
}

export async function loadTopContent(
  resourceType: AnalyticsResourceType,
  limit = 10
): Promise<TopContentRow[]> {
  const grouped = await db.pageView.groupBy({
    by: ["slug"],
    where: {
      resourceType,
      slug: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  const slugs = grouped
    .map((g) => g.slug)
    .filter((s): s is string => Boolean(s))

  if (slugs.length === 0) return []

  if (resourceType === "blog_post") {
    const posts = await db.post.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, title: true },
    })
    const titleBySlug = new Map(posts.map((p) => [p.slug, p.title]))
    return grouped.map((row) => ({
      slug: row.slug!,
      title: titleBySlug.get(row.slug!) ?? row.slug!,
      views: row._count.id,
    }))
  }

  if (resourceType === "project") {
    const projects = await db.project.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, title: true },
    })
    const titleBySlug = new Map(projects.map((p) => [p.slug, p.title]))
    return grouped.map((row) => ({
      slug: row.slug!,
      title: titleBySlug.get(row.slug!) ?? row.slug!,
      views: row._count.id,
    }))
  }

  if (resourceType === "news_item") {
    const items = await db.news.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, title: true },
    })
    const titleBySlug = new Map(items.map((n) => [n.slug, n.title]))
    return grouped.map((row) => ({
      slug: row.slug!,
      title: titleBySlug.get(row.slug!) ?? row.slug!,
      views: row._count.id,
    }))
  }

  return []
}

export type ReferrerRow = {
  referrer: string
  views: number
}

export async function loadTopReferrers(limit = 10): Promise<ReferrerRow[]> {
  const since30d = new Date()
  since30d.setDate(since30d.getDate() - 30)

  const grouped = await db.pageView.groupBy({
    by: ["referrer"],
    where: {
      createdAt: { gte: since30d },
      referrer: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  return grouped.map((row) => ({
    referrer: row.referrer!,
    views: row._count.id,
  }))
}

export type CountryRow = {
  country: string
  views: number
}

export async function loadTopCountries(limit = 10): Promise<CountryRow[]> {
  const since30d = new Date()
  since30d.setDate(since30d.getDate() - 30)

  const grouped = await db.pageView.groupBy({
    by: ["country"],
    where: {
      createdAt: { gte: since30d },
      country: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  return grouped.map((row) => ({
    country: row.country!,
    views: row._count.id,
  }))
}

export async function loadAnalyticsDashboardData() {
  const [
    summary,
    viewsBySection,
    topPosts,
    topProjects,
    topNews,
    referrers,
    countries,
  ] = await Promise.all([
    loadAnalyticsSummary(),
    loadViewsBySection(),
    loadTopContent("blog_post", 10),
    loadTopContent("project", 10),
    loadTopContent("news_item", 10),
    loadTopReferrers(10),
    loadTopCountries(10),
  ])

  return {
    summary,
    viewsBySection,
    topPosts,
    topProjects,
    topNews,
    referrers,
    countries,
    posthogHost:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    posthogConfigured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
  }
}

export type AnalyticsDashboardData = Awaited<
  ReturnType<typeof loadAnalyticsDashboardData>
>
