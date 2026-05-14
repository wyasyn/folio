export type DashboardSectionId =
  | "overview"
  | "projects"
  | "posts"
  | "news"
  | "tags"
  | "tech-stacks"
  | "screenshots"
  | "users"
  | "settings"

export type DashboardSection = {
  id: DashboardSectionId
  label: string
  href: string
  adminOnly?: boolean
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
    id: "posts",
    label: "Posts",
    href: "/dashboard/posts",
  },
  {
    id: "news",
    label: "News",
    href: "/dashboard/news",
  },
  {
    id: "tags",
    label: "Tags",
    href: "/dashboard/tags",
    adminOnly: true,
  },
  {
    id: "tech-stacks",
    label: "Tech Stacks",
    href: "/dashboard/tech-stacks",
    adminOnly: true,
  },
  {
    id: "screenshots",
    label: "Screenshots",
    href: "/dashboard/screenshots",
    adminOnly: true,
  },
  {
    id: "users",
    label: "Users",
    href: "/dashboard/users",
    adminOnly: true,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
  },
]

export function getDashboardSectionById(
  id: DashboardSectionId
): DashboardSection {
  return (
    dashboardSections.find((section) => section.id === id) ??
    dashboardSections[0]
  )
}

export function getDashboardSectionByPath(pathname: string): DashboardSection {
  if (pathname.startsWith("/photo/")) {
    return getDashboardSectionById("screenshots")
  }

  const exactMatch = dashboardSections.find(
    (section) => section.href === pathname
  )
  if (exactMatch) {
    return exactMatch
  }

  const nestedMatch = dashboardSections.find(
    (section) =>
      section.href !== "/dashboard" && pathname.startsWith(section.href)
  )

  return nestedMatch ?? dashboardSections[0]
}
