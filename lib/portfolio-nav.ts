import {
  IconArticle,
  IconFolder,
  IconHome,
  IconMail,
  IconNews,
  IconTools,
  type Icon,
} from "@tabler/icons-react"

export type PortfolioNavItem = {
  label: string
  href: string
  icon: Icon
  keywords?: string[]
}

export const portfolioNavItems: PortfolioNavItem[] = [
  { label: "Home", href: "/", icon: IconHome, keywords: ["portfolio", "start"] },
  {
    label: "Projects",
    href: "/projects",
    icon: IconFolder,
    keywords: ["work", "case studies"],
  },
  {
    label: "Blog",
    href: "/blog",
    icon: IconArticle,
    keywords: ["articles", "writing", "posts"],
  },
  {
    label: "News",
    href: "/news",
    icon: IconNews,
    keywords: ["updates", "announcements"],
  },
  {
    label: "Uses",
    href: "/uses",
    icon: IconTools,
    keywords: ["tools", "setup", "gear"],
  },
  {
    label: "Contact",
    href: "/contact",
    icon: IconMail,
    keywords: ["email", "message", "hire"],
  },
]
