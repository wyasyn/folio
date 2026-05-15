export type AssistContext =
  | "post"
  | "news"
  | "project"
  | "profile"

export type AssistFocus =
  | "general"
  | "title"
  | "description"
  | "content"
  | "tags"
  | "tech-stacks"
  | "seo"
  | "positioning"
  | "tagline"
  | "bio"

export type AssistDraftPayload = {
  title?: string
  description?: string
  content?: string
  tags?: string[]
  techStacks?: string[]
  published?: boolean
  featured?: boolean
  bio?: string
  tagline?: string
  jobTitle?: string
}

export const ASSIST_FOCUS_OPTIONS: Record<
  AssistContext,
  { id: AssistFocus; label: string }[]
> = {
  post: [
    { id: "general", label: "Overall" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
    { id: "content", label: "Content" },
    { id: "tags", label: "Tags" },
    { id: "seo", label: "SEO" },
  ],
  news: [
    { id: "general", label: "Overall" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
    { id: "content", label: "Content" },
    { id: "tags", label: "Tags" },
  ],
  project: [
    { id: "general", label: "Overall" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
    { id: "content", label: "Case study" },
    { id: "tech-stacks", label: "Tech stack" },
    { id: "positioning", label: "Positioning" },
  ],
  profile: [
    { id: "general", label: "Overall" },
    { id: "tagline", label: "Tagline" },
    { id: "bio", label: "Bio" },
    { id: "positioning", label: "Positioning" },
  ],
}

export function buildAssistUserPrompt(
  context: AssistContext,
  focus: AssistFocus,
  draft: AssistDraftPayload,
  mode: "create" | "edit",
): string {
  const contextLabel =
    context === "post"
      ? "blog post"
      : context === "news"
        ? "news item"
        : context === "project"
          ? "project"
          : "site profile"

  const focusLine =
    focus === "general"
      ? "Review the draft holistically."
      : `Focus specifically on improving the **${focus}** aspect.`

  return `${focusLine}

You are helping improve a ${contextLabel} (${mode === "create" ? "new draft" : "editing existing"}).

## Current draft (from the editor)
\`\`\`json
${JSON.stringify(draft, null, 2)}
\`\`\`

Provide:
1. Brief assessment (2–3 sentences)
2. Specific suggestions (bullets) — quote or reference their draft where helpful
3. When useful, example rewrites (clearly labeled as suggestions, not commands)
4. A short prioritized checklist of what to do next

Do not tell them to publish unless the draft is genuinely ready.`
}
