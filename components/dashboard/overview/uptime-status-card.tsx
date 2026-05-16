import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { UptimeStatus } from "@/lib/uptime/uptime-status"

type UptimeStatusCardProps = {
  status: UptimeStatus
}

function statusLabel(status: UptimeStatus & { configured: true }) {
  switch (status.status) {
    case "up":
      return { text: "Operational", className: "text-emerald-600 dark:text-emerald-400" }
    case "down":
      return { text: "Down", className: "text-destructive" }
    case "paused":
      return { text: "Paused", className: "text-muted-foreground" }
    default:
      return { text: "Unknown", className: "text-muted-foreground" }
  }
}

export function UptimeStatusCard({ status }: UptimeStatusCardProps) {
  if (!status.configured) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Site uptime</CardTitle>
          <CardDescription>External monitoring not configured</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Add <code className="text-xs">UPTIME_API_KEY</code> and{" "}
            <code className="text-xs">UPTIME_MONITOR_ID</code> (UptimeRobot) to
            show live status here.
          </p>
          <p>
            Point your monitor at{" "}
            <code className="text-xs">/api/health</code> on your production URL.
          </p>
        </CardContent>
      </Card>
    )
  }

  const label = statusLabel(status)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Site uptime</CardTitle>
        <CardDescription>
          {status.monitorName ?? "Production monitor"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`text-2xl font-semibold ${label.className}`}>{label.text}</p>
        {status.uptimeRatio30d != null ? (
          <p className="text-sm text-muted-foreground tabular-nums">
            {status.uptimeRatio30d.toFixed(2)}% uptime (30 days)
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Uptime ratio unavailable from provider
          </p>
        )}
      </CardContent>
    </Card>
  )
}
