import { ContentPublishedChart } from "@/components/dashboard/overview/content-published-chart"
import { OverviewStatCards } from "@/components/dashboard/overview/overview-stat-cards"
import { PageViewsChart } from "@/components/dashboard/overview/page-views-chart"
import { ProjectsByStackChart } from "@/components/dashboard/overview/projects-by-stack-chart"
import { QuickActionsCard } from "@/components/dashboard/overview/quick-actions-card"
import { RecentPostsCard } from "@/components/dashboard/overview/recent-posts-card"
import { TopProjectsChart } from "@/components/dashboard/overview/top-projects-chart"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"
import { loadOverviewData } from "@/lib/dashboard/overview-data"

function formatOverviewDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default async function Page() {
  const overviewSection = getDashboardSectionById("overview")
  const data = await loadOverviewData()
  const today = formatOverviewDate(new Date())

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="mt-1 text-2xl lg:text-4xl font-semibold text-foreground">
          {overviewSection.label}
        </h1>
      </div>

      <OverviewStatCards cards={data.statCards} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectsByStackChart data={data.stackSlices} />
        <ContentPublishedChart data={data.contentPublished} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PageViewsChart />
        <TopProjectsChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentPostsCard posts={data.recentPosts} />
        <QuickActionsCard />
      </div>
    </section>
  )
}
