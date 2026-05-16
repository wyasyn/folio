import { unstable_cache } from "next/cache"

export type UptimeStatus =
  | {
      configured: true
      status: "up" | "down" | "paused" | "unknown"
      uptimeRatio30d: number | null
      lastIncidentAt: string | null
      monitorName: string | null
    }
  | {
      configured: false
    }

type UptimeRobotMonitor = {
  id: number
  friendly_name: string
  status: number
  custom_uptime_ratio: string
}

type UptimeRobotResponse = {
  stat: string
  monitors?: UptimeRobotMonitor[]
}

async function fetchUptimeRobotStatus(): Promise<UptimeStatus> {
  const apiKey = process.env.UPTIME_API_KEY
  const monitorId = process.env.UPTIME_MONITOR_ID

  if (!apiKey || !monitorId) {
    return { configured: false }
  }

  try {
    const body = new URLSearchParams({
      api_key: apiKey,
      format: "json",
      monitors: monitorId,
      custom_uptime_ratios: "30",
    })

    const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return {
        configured: true,
        status: "unknown",
        uptimeRatio30d: null,
        lastIncidentAt: null,
        monitorName: null,
      }
    }

    const data = (await response.json()) as UptimeRobotResponse
    if (data.stat !== "ok" || !data.monitors?.length) {
      return {
        configured: true,
        status: "unknown",
        uptimeRatio30d: null,
        lastIncidentAt: null,
        monitorName: null,
      }
    }

    const monitor = data.monitors[0]!
    const statusMap: Record<number, "up" | "down" | "paused" | "unknown"> = {
      0: "paused",
      1: "unknown",
      2: "up",
      8: "up",
      9: "down",
    }

    const ratio = Number.parseFloat(monitor.custom_uptime_ratio)
    return {
      configured: true,
      status: statusMap[monitor.status] ?? "unknown",
      uptimeRatio30d: Number.isFinite(ratio) ? ratio : null,
      lastIncidentAt: null,
      monitorName: monitor.friendly_name,
    }
  } catch {
    return {
      configured: true,
      status: "unknown",
      uptimeRatio30d: null,
      lastIncidentAt: null,
      monitorName: null,
    }
  }
}

const getCachedUptimeStatus = unstable_cache(
  fetchUptimeRobotStatus,
  ["uptime-status"],
  { revalidate: 300 }
)

export async function loadUptimeStatus(): Promise<UptimeStatus> {
  return getCachedUptimeStatus()
}
