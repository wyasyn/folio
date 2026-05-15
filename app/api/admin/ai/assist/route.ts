import { createAdminAiStreamResponse } from "@/lib/ai/admin-ai-response"
import {
  buildAssistUserPrompt,
  type AssistContext,
  type AssistDraftPayload,
  type AssistFocus,
} from "@/lib/ai/assist-types"
import {
  DASHBOARD_AI_INSTRUCTIONS,
  getDashboardAiContext,
} from "@/lib/ai/dashboard-context"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"

const CONTEXTS = new Set<AssistContext>(["post", "news", "project", "profile"])
const FOCUSES = new Set<AssistFocus>([
  "general",
  "title",
  "description",
  "content",
  "tags",
  "tech-stacks",
  "seo",
  "positioning",
  "tagline",
  "bio",
])

type AssistRequestBody = {
  context?: unknown
  focus?: unknown
  mode?: unknown
  draft?: unknown
}

function parseDraft(value: unknown): AssistDraftPayload {
  if (typeof value !== "object" || value === null) return {}
  const d = value as Record<string, unknown>
  return {
    ...(typeof d.title === "string" ? { title: d.title } : {}),
    ...(typeof d.description === "string" ? { description: d.description } : {}),
    ...(typeof d.content === "string" ? { content: d.content } : {}),
    ...(Array.isArray(d.tags)
      ? { tags: d.tags.filter((t): t is string => typeof t === "string") }
      : {}),
    ...(Array.isArray(d.techStacks)
      ? {
          techStacks: d.techStacks.filter(
            (t): t is string => typeof t === "string",
          ),
        }
      : {}),
    ...(typeof d.published === "boolean" ? { published: d.published } : {}),
    ...(typeof d.featured === "boolean" ? { featured: d.featured } : {}),
    ...(typeof d.bio === "string" ? { bio: d.bio } : {}),
    ...(typeof d.tagline === "string" ? { tagline: d.tagline } : {}),
    ...(typeof d.jobTitle === "string" ? { jobTitle: d.jobTitle } : {}),
  }
}

export async function POST(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  let body: AssistRequestBody
  try {
    body = (await request.json()) as AssistRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const context =
    typeof body.context === "string" && CONTEXTS.has(body.context as AssistContext)
      ? (body.context as AssistContext)
      : null
  const focus =
    typeof body.focus === "string" && FOCUSES.has(body.focus as AssistFocus)
      ? (body.focus as AssistFocus)
      : "general"
  const mode = body.mode === "edit" ? "edit" : "create"

  if (!context) {
    return Response.json({ error: "Invalid assist context." }, { status: 400 })
  }

  const draft = parseDraft(body.draft)
  const siteContext = await getDashboardAiContext()
  const userPrompt = buildAssistUserPrompt(context, focus, draft, mode)

  return createAdminAiStreamResponse({
    systemInstructions: DASHBOARD_AI_INSTRUCTIONS,
    cacheableContext: siteContext,
    userPrompt,
  })
}
