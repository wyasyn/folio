import { getAdviseTopic } from "@/lib/ai/advise-topics"
import { createAdminAiStreamResponse } from "@/lib/ai/admin-ai-response"
import {
  DASHBOARD_AI_INSTRUCTIONS,
  getDashboardAiContext,
} from "@/lib/ai/dashboard-context"
import { getRequestSession, unauthorizedResponse } from "@/lib/authz"

type AdviseRequestBody = {
  topic?: unknown
}

export async function POST(request: Request) {
  const session = await getRequestSession(request)
  if (!session) return unauthorizedResponse()

  let body: AdviseRequestBody
  try {
    body = (await request.json()) as AdviseRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const topicId = typeof body.topic === "string" ? body.topic.trim() : ""
  const topic = getAdviseTopic(topicId)
  if (!topic) {
    return Response.json({ error: "Invalid advise topic." }, { status: 400 })
  }

  const context = await getDashboardAiContext()

  return createAdminAiStreamResponse({
    systemInstructions: DASHBOARD_AI_INSTRUCTIONS,
    cacheableContext: context,
    userPrompt: topic.prompt,
  })
}
