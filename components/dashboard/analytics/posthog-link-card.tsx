import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PostHogLinkCardProps = {
  configured: boolean
  host: string
}

function posthogAppUrl(ingestHost: string): string {
  const trimmed = ingestHost.replace(/\/$/, "")
  if (trimmed.includes(".i.posthog.com")) {
    return trimmed.replace(".i.posthog.com", ".posthog.com")
  }
  return "https://app.posthog.com"
}

export function PostHogLinkCard({ configured, host }: PostHogLinkCardProps) {
  const projectHost = posthogAppUrl(host)

  return (
    <Card>
      <CardHeader>
        <CardTitle>PostHog</CardTitle>
        <CardDescription>
          Session replay, funnels, and device-level breakdowns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {configured ? (
          <>
            <p>
              First-party metrics above come from your database. Use PostHog for
              deeper analysis.
            </p>
            <Link
              href={`${projectHost}/project`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              Open PostHog dashboard →
            </Link>
          </>
        ) : (
          <p>
            Set <code className="text-xs">NEXT_PUBLIC_POSTHOG_KEY</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_POSTHOG_HOST</code> in your
            environment to enable client analytics alongside first-party page
            views.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
