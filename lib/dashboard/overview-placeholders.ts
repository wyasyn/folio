/** PLACEHOLDER — replace with real analytics when view tracking exists. */

export const profileViewsKpi = {
  value: "1.4k",
  detail: "↑ 18% vs last month",
  positive: true,
} as const

export const pageViewsChart = {
  total: 8340,
  subtitle: "Last 6 months · sample data",
  data: [
    { month: "Dec", views: 820 },
    { month: "Jan", views: 1050 },
    { month: "Feb", views: 1180 },
    { month: "Mar", views: 1320 },
    { month: "Apr", views: 1580 },
    { month: "May", views: 1890 },
  ],
} as const

export const topProjectsByViews = {
  subtitle: "Sample data until view tracking ships",
  data: [
    { name: "Folio", views: 620 },
    { name: "CodeSync", views: 480 },
    { name: "Ledger", views: 340 },
  ],
} as const
