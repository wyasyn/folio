import { AiAdviseSection } from "@/components/dashboard/ai/ai-advise-section"
import { AiSettingsForm } from "@/components/dashboard/ai/ai-settings-form"
import { AiUsageChart } from "@/components/dashboard/ai/ai-usage-chart"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"
import {
  loadAiUsageChartData,
  loadAiUsageSummary,
} from "@/lib/dashboard/ai-usage-data"
import { getSavedOpenRouterModels } from "@/lib/ai/saved-openrouter-models"
import {
  getSiteAiSettings,
  isOpenRouterConfigured,
} from "@/lib/ai/site-ai-settings"

export default async function DashboardAiPage() {
  const section = getDashboardSectionById("ai")
  const [settings, models, aiUsage, aiSummary] = await Promise.all([
    getSiteAiSettings(),
    getSavedOpenRouterModels(),
    loadAiUsageChartData(),
    loadAiUsageSummary(),
  ])

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight lg:text-4xl">
          {section.label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Portfolio Ask chat, site advise, editor AI help, and usage analytics.
          Prompt caching reduces cost on repeated requests.
        </p>
      </div>

      <AiAdviseSection openRouterConfigured={isOpenRouterConfigured()} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <AiSettingsForm
          initialChatModel={settings.chatModel}
          initialChatEnabled={settings.chatEnabled}
          initialModels={models}
          openRouterConfigured={isOpenRouterConfigured()}
        />
        <AiUsageChart
          data={aiUsage}
          monthRequests={aiSummary.monthRequests}
          monthTokens={aiSummary.monthTokens}
        />
      </div>
    </section>
  )
}
