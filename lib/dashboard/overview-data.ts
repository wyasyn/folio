import db from "@/lib/db"
import {
  pageViewsChart,
  profileViewsKpi,
  topProjectsByViews,
} from "@/lib/dashboard/overview-placeholders"

export type StatCardData = {
  label: string
  value: string | number
  detail: string
  positive: boolean | null
}

export type StackSlice = {
  name: string
  count: number
  fill: string
}

export type MonthlyContent = {
  month: string
  posts: number
  projects: number
}

export type RecentPost = {
  title: string
  date: string
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

function formatDelta(current: number, previous: number): {
  detail: string
  positive: boolean | null
} {
  if (current === previous) {
    return { detail: "No change", positive: null }
  }
  const diff = current - previous
  if (diff > 0) {
    return { detail: `+${diff} this month`, positive: true }
  }
  return { detail: `${diff} this month`, positive: false }
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

const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

export async function loadOverviewData() {
  const currentMonth = monthRange(0)
  const previousMonth = monthRange(-1)
  const months = getLast6Months()

  const [
    projectsPublished,
    postsPublished,
    newsPublished,
    projectsThisMonth,
    projectsLastMonth,
    postsThisMonth,
    postsLastMonth,
    newsThisMonth,
    newsLastMonth,
    techStacks,
    projectsWithoutStack,
    recentPosts,
    ...monthlyCounts
  ] = await Promise.all([
    db.project.count({ where: { published: true } }),
    db.post.count({ where: { published: true } }),
    db.news.count({ where: { published: true } }),
    db.project.count({
      where: {
        createdAt: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
    }),
    db.project.count({
      where: {
        createdAt: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
    }),
    db.post.count({
      where: {
        createdAt: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
    }),
    db.post.count({
      where: {
        createdAt: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
    }),
    db.news.count({
      where: {
        createdAt: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
    }),
    db.news.count({
      where: {
        createdAt: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
    }),
    db.techStack.findMany({
      select: {
        name: true,
        _count: {
          select: {
            Project: { where: { published: true } },
          },
        },
      },
    }),
    db.project.count({
      where: {
        published: true,
        TechStack: { none: {} },
      },
    }),
    db.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { title: true, updatedAt: true },
    }),
    ...months.flatMap((m) => [
      db.post.count({
        where: { createdAt: { gte: m.start, lte: m.end } },
      }),
      db.project.count({
        where: { createdAt: { gte: m.start, lte: m.end } },
      }),
    ]),
  ])

  const projectsDelta = formatDelta(projectsThisMonth, projectsLastMonth)
  const postsDelta = formatDelta(postsThisMonth, postsLastMonth)
  const newsDelta = formatDelta(newsThisMonth, newsLastMonth)

  const statCards: StatCardData[] = [
    {
      label: "Projects",
      value: projectsPublished,
      detail: projectsDelta.detail,
      positive: projectsDelta.positive,
    },
    {
      label: "Blog posts",
      value: postsPublished,
      detail: postsDelta.detail,
      positive: postsDelta.positive,
    },
    {
      label: "News items",
      value: newsPublished,
      detail: newsDelta.detail,
      positive: newsDelta.positive,
    },
    {
      label: "Profile views",
      value: profileViewsKpi.value,
      detail: profileViewsKpi.detail,
      positive: profileViewsKpi.positive,
    },
  ]

  const stackSlices: StackSlice[] = [...techStacks]
    .filter((s) => s._count.Project > 0)
    .sort((a, b) => b._count.Project - a._count.Project)
    .map((s, i) => ({
      name: s.name,
      count: s._count.Project,
      fill: CHART_FILLS[i % CHART_FILLS.length]!,
    }))

  if (projectsWithoutStack > 0) {
    stackSlices.push({
      name: "Other",
      count: projectsWithoutStack,
      fill: CHART_FILLS[stackSlices.length % CHART_FILLS.length],
    })
  }

  const contentPublished: MonthlyContent[] = months.map((m, i) => ({
    month: m.label,
    posts: monthlyCounts[i * 2] as number,
    projects: monthlyCounts[i * 2 + 1] as number,
  }))

  const recent: RecentPost[] = recentPosts.map((post) => ({
    title: post.title,
    date: post.updatedAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }))

  return {
    statCards,
    stackSlices,
    contentPublished,
    recentPosts: recent,
    pageViews: pageViewsChart,
    topProjects: topProjectsByViews,
  }
}

export type OverviewData = Awaited<ReturnType<typeof loadOverviewData>>
