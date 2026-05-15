import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import { normalizeStoredContentToMarkdown } from "@/lib/content-markdown"
import db from "@/lib/db"
import { getSiteProfile } from "@/lib/public/site-profile"
import { usesCategories } from "@/lib/uses-data"

const MAX_CONTENT_CHARS = 12_000

function truncate(value: string, max = MAX_CONTENT_CHARS) {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}\n\n[Content truncated for length…]`
}

async function buildPortfolioAiContext(): Promise<string> {
  const [profile, posts, news, projects] = await Promise.all([
    getSiteProfile(),
    db.post.findMany({
      where: { published: true },
      select: { slug: true, title: true, description: true, content: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.news.findMany({
      where: { published: true },
      select: { slug: true, title: true, description: true, content: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.project.findMany({
      where: { published: true },
      select: { slug: true, title: true, description: true, content: true },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const usesText = usesCategories
    .map(
      (cat) =>
        `### ${cat.title}\n${cat.items.map((i) => `- ${i.name}${i.description ? `: ${i.description}` : ""}`).join("\n")}`,
    )
    .join("\n\n")

  const postsText = posts
    .map(
      (p) =>
        `## Blog: ${p.title} (/blog/${p.slug})\n${p.description ?? ""}\n\n${normalizeStoredContentToMarkdown(p.content)}`,
    )
    .join("\n\n---\n\n")

  const newsText = news
    .map(
      (n) =>
        `## News: ${n.title} (/news/${n.slug})\n${n.description ?? ""}\n\n${normalizeStoredContentToMarkdown(n.content)}`,
    )
    .join("\n\n---\n\n")

  const projectsText = projects
    .map(
      (p) =>
        `## Project: ${p.title} (/projects/${p.slug})\n${p.description}\n\n${normalizeStoredContentToMarkdown(p.content)}`,
    )
    .join("\n\n---\n\n")

  return truncate(
    [
      "# Portfolio knowledge base",
      "",
      "You may ONLY answer using the information below. If the answer is not in this context, say you do not have that information on this portfolio site and suggest browsing the relevant section.",
      "",
      "## Owner profile",
      `Name: ${profile.name}`,
      `Title: ${profile.title}`,
      `Tagline: ${profile.tagline}`,
      profile.bio ? `Bio: ${profile.bio}` : "",
      "",
      "## Uses / tools",
      usesText,
      "",
      "## Projects",
      projectsText || "_No published projects._",
      "",
      "## Blog posts",
      postsText || "_No published posts._",
      "",
      "## News",
      newsText || "_No published news._",
    ]
      .filter(Boolean)
      .join("\n"),
    48_000,
  )
}

export const getPortfolioAiContext = unstable_cache(
  buildPortfolioAiContext,
  ["portfolio-ai-context"],
  {
    tags: [
      CACHE_TAGS.searchIndex,
      CACHE_TAGS.posts,
      CACHE_TAGS.news,
      CACHE_TAGS.projects,
      CACHE_TAGS.siteProfile,
    ],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)

export const PORTFOLIO_CHAT_INSTRUCTIONS = `You are a helpful assistant on a personal portfolio website. You must follow these rules strictly:

1. Answer ONLY using the portfolio knowledge base below. Do not use outside knowledge about the owner, their work, or general facts unless they appear in the context.
2. If the user asks about something not covered in the context, politely say it is not available on this site and point them to relevant pages (Projects, Blog, News, Contact) when appropriate.
3. Be concise, friendly, and accurate. Quote or paraphrase the context when helpful.
4. Never invent projects, posts, news, skills, or biographical details.

# Portfolio knowledge base`

/** @deprecated Use PORTFOLIO_CHAT_INSTRUCTIONS + cached context body instead. */
export function buildChatSystemPrompt(context: string) {
  return `${PORTFOLIO_CHAT_INSTRUCTIONS}\n\n${context}`
}
