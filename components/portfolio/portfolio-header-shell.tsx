import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import {
  getSiteAiSettings,
  isOpenRouterConfigured,
} from "@/lib/ai/site-ai-settings"

export async function PortfolioHeaderShell() {
  const settings = await getSiteAiSettings()

  return (
    <PortfolioHeader
      chatEnabled={settings.chatEnabled}
      chatConfigured={isOpenRouterConfigured()}
    />
  )
}
