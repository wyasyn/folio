import { unstable_cache } from "next/cache"
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/tags"
import { normalizeStoredContentToMarkdown } from "@/lib/content-markdown"
import db from "@/lib/db"
import { getSiteProfile } from "@/lib/public/site-profile"
import { usesCategories } from "@/lib/uses-data"

const MAX_CONTENT_CHARS = 10_000
const MAX_CONTEXT_CHARS = 56_000

function truncate(value: string, max = MAX_CONTENT_CHARS) {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}\n\n[Truncated…]`
}

async function buildDashboardAiContext(): Promise<string> {
  const [profile, posts, news, projects, tags, techStacks] = await Promise.all([
    getSiteProfile(),
    db.post.findMany({
      select: {
        slug: true,
        title: true,
        description: true,
        content: true,
        published: true,
        featured: true,
        readTime: true,
        updatedAt: true,
        Tag: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.news.findMany({
      select: {
        slug: true,
        title: true,
        description: true,
        content: true,
        published: true,
        featured: true,
        readTime: true,
        updatedAt: true,
        tags: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.project.findMany({
      select: {
        slug: true,
        title: true,
        description: true,
        content: true,
        published: true,
        featured: true,
        liveUrl: true,
        githubUrl: true,
        updatedAt: true,
        TechStack: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    db.techStack.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ])

  const usesText = usesCategories
    .map(
      (cat) =>
        `### ${cat.title}\n${cat.items.map((i) => `- ${i.name}${i.description ? `: ${i.description}` : ""}`).join("\n")}`,
    )
    .join("\n\n")

  type ContentRow = {
    slug: string
    title: string
    description: string | null
    featured: boolean
    readTime: number
    content: string
    published: boolean
  }

  const formatPost = (
    p: ContentRow,
    kind: "Blog" | "News",
    path: string,
    tagNames: string[],
  ) =>
    `## ${kind}: ${p.title} (${path})\nStatus: ${p.published ? "published" : "draft"}${p.featured ? ", featured" : ""}\nTags: ${tagNames.join(", ") || "none"}\nRead time: ${p.readTime} min\n${p.description ?? ""}\n\n${truncate(normalizeStoredContentToMarkdown(p.content))}`

  const postsText = posts
    .map((p) =>
      formatPost(
        p,
        "Blog",
        `/blog/${p.slug}`,
        p.Tag.map((t) => t.name),
      ),
    )
    .join("\n\n---\n\n")

  const newsText = news
    .map((n) =>
      formatPost(
        n,
        "News",
        `/news/${n.slug}`,
        n.tags.map((t) => t.name),
      ),
    )
    .join("\n\n---\n\n")

  const projectsText = projects
    .map(
      (p) =>
        `## Project: ${p.title} (/projects/${p.slug})\nStatus: ${p.published ? "published" : "draft"}${p.featured ? ", featured" : ""}\nStack: ${p.TechStack.map((t) => t.name).join(", ") || "none"}\nLive: ${p.liveUrl ?? "—"} | GitHub: ${p.githubUrl ?? "—"}\n${p.description}\n\n${truncate(normalizeStoredContentToMarkdown(p.content))}`,
    )
    .join("\n\n---\n\n")

  const body = [
    "# Site admin knowledge base",
    "",
    "Use this data to advise the portfolio owner. Include drafts and published items.",
    "",
    "## Owner profile",
    `Name: ${profile.name}`,
    `Title: ${profile.title}`,
    `Tagline: ${profile.tagline}`,
    profile.bio ? `Bio: ${profile.bio}` : "",
    profile.socialLinks.length
      ? `Links: ${profile.socialLinks.map((l) => `${l.label}: ${l.href}`).join("; ")}`
      : "",
    "",
    "## Catalog",
    `Tags in use: ${tags.map((t) => t.name).join(", ") || "none"}`,
    `Tech stacks: ${techStacks.map((t) => t.name).join(", ") || "none"}`,
    "",
    "## Uses page (static)",
    usesText,
    "",
    "## Projects",
    projectsText || "_No projects yet._",
    "",
    "## Blog posts",
    postsText || "_No blog posts yet._",
    "",
    "## News",
    newsText || "_No news yet._",
  ]
    .filter(Boolean)
    .join("\n")

  if (body.length <= MAX_CONTEXT_CHARS) return body
  return `${body.slice(0, MAX_CONTEXT_CHARS)}\n\n[Knowledge base truncated for length…]`
}

export const getDashboardAiContext = unstable_cache(
  buildDashboardAiContext,
  ["dashboard-ai-context"],
  {
    tags: [
      CACHE_TAGS.posts,
      CACHE_TAGS.news,
      CACHE_TAGS.projects,
      CACHE_TAGS.siteProfile,
    ],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
)

export const DASHBOARD_AI_INSTRUCTIONS = `You are an expert portfolio and content strategist helping the site owner manage their personal portfolio.

Rules:
1. Base recommendations only on the site admin knowledge base and any draft the owner shares in the current request.
2. Be specific, actionable, and concise. Use bullet lists and clear next steps.
3. Do not invent projects, posts, or metrics that are not in the context.
4. When suggesting blog ideas or improvements, align with their existing stack, tone, and published work.
5. Format responses in Markdown.`
