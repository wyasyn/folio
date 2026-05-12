export type DashboardSectionId = "overview" | "projects" | "blog" | "settings"

export type DashboardSection = {
  id: DashboardSectionId
  label: string
  href: string
}

export const dashboardSections: DashboardSection[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard",
  },
  {
    id: "projects",
    label: "Projects",
    href: "/dashboard/projects",
  },
  {
    id: "blog",
    label: "Blog",
    href: "/dashboard/blog",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
  },
]

export function getDashboardSectionById(id: DashboardSectionId): DashboardSection {
  return dashboardSections.find((section) => section.id === id) ?? dashboardSections[0]
}

export function getDashboardSectionByPath(pathname: string): DashboardSection {
  const exactMatch = dashboardSections.find((section) => section.href === pathname)
  if (exactMatch) {
    return exactMatch
  }

  const nestedMatch = dashboardSections.find(
    (section) => section.href !== "/dashboard" && pathname.startsWith(section.href),
  )

  return nestedMatch ?? dashboardSections[0]
}
