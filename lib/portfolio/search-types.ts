export type PortfolioSearchItemType =
  | "page"
  | "project"
  | "post"
  | "news"
  | "site"
  | "uses"

export type PortfolioSearchItem = {
  id: string
  type: PortfolioSearchItemType
  title: string
  subtitle?: string
  href: string
  /** Combined text used by cmdk for filtering */
  keywords: string
}

export const searchGroupLabels: Record<PortfolioSearchItemType, string> = {
  page: "Pages",
  site: "About",
  project: "Projects",
  post: "Blog",
  news: "News",
  uses: "Uses",
}

export const searchGroupOrder: PortfolioSearchItemType[] = [
  "page",
  "site",
  "project",
  "post",
  "news",
  "uses",
]
