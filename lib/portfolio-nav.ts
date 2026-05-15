export type PortfolioNavItem = {
  label: string
  href: string
  keywords?: string[]
}

export const portfolioNavItems: PortfolioNavItem[] = [
  { label: "Home", href: "/", keywords: ["portfolio", "start"] },
  { label: "Projects", href: "/projects", keywords: ["work", "case studies"] },
  { label: "Blog", href: "/blog", keywords: ["articles", "writing", "posts"] },
  { label: "News", href: "/news", keywords: ["updates", "announcements"] },
  { label: "Uses", href: "/uses", keywords: ["tools", "setup", "gear"] },
  { label: "Contact", href: "/contact", keywords: ["email", "message", "hire"] },
]
