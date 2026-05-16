export const CACHE_TAGS = {
  posts: "posts",
  post: (slug: string) => `post:${slug}`,
  news: "news",
  newsItem: (slug: string) => `news:${slug}`,
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  siteProfile: "site-profile",
  sitemap: "sitemap",
  searchIndex: "search-index",
  aiSettings: "ai-settings",
  openrouterModels: "openrouter-models",
} as const

export const PUBLIC_REVALIDATE_SECONDS = 3600
