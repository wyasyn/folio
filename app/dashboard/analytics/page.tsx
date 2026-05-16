import { AnalyticsSummaryCards } from "@/components/dashboard/analytics/analytics-summary-cards"
import { PostHogLinkCard } from "@/components/dashboard/analytics/posthog-link-card"
import { ReferrerCountryLists } from "@/components/dashboard/analytics/referrer-country-lists"
import { TopContentTable } from "@/components/dashboard/analytics/top-content-table"
import { ViewsBySectionChart } from "@/components/dashboard/analytics/views-by-section-chart"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"
import { loadAnalyticsDashboardData } from "@/lib/dashboard/analytics-data"

export default async function AnalyticsPage() {
  const section = getDashboardSectionById("analytics")
  const data = await loadAnalyticsDashboardData()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Portfolio traffic, audience, and content performance
        </p>
      </div>

      <AnalyticsSummaryCards summary={data.summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ViewsBySectionChart data={data.viewsBySection} />
        <PostHogLinkCard
          configured={data.posthogConfigured}
          host={data.posthogHost}
        />
      </div>

      <ReferrerCountryLists
        referrers={data.referrers}
        countries={data.countries}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <TopContentTable
          title="Top blog posts"
          description="Detail page views · all time"
          rows={data.topPosts}
        />
        <TopContentTable
          title="Top projects"
          description="Detail page views · all time"
          rows={data.topProjects}
        />
        <TopContentTable
          title="Top news"
          description="Detail page views · all time"
          rows={data.topNews}
        />
      </div>
    </section>
  )
}
