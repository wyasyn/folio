import TurndownService from "turndown"

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" })

turndown.addRule("fencedCodeBlocks", {
  filter: ["pre"],
  replacement(content: string, node: Node) {
    const codeNode = node.firstChild as HTMLElement | null
    const codeText = codeNode?.textContent ?? content
    return `\n\n\`\`\`\n${codeText.trim()}\n\`\`\`\n\n`
  },
})

export function looksLikeStoredHtml(value: string) {
  const t = value.trimStart()
  return t.startsWith("<") && /<\/[a-z][\s\S]*>/i.test(t)
}

export function normalizeStoredContentToMarkdown(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (looksLikeStoredHtml(trimmed)) {
    return turndown.turndown(trimmed).trim()
  }
  return value
}

export function isMarkdownContentEmpty(value: string) {
  const t = value.trim()
  if (!t) return true
  if (/!\[[^\]]*\]\([^)]+\)/.test(t)) return false
  if (/<iframe[\s>]/i.test(t)) return false
  const withoutFenced = t.replace(/```[\s\S]*?```/g, "")
  const withoutInlineCode = withoutFenced.replace(/`[^`]*`/g, "")
  const withoutDisplayMath = withoutInlineCode.replace(/\$\$[\s\S]*?\$\$/g, "")
  const stripped = withoutDisplayMath
    .replace(/\$[^$\n]+\$/g, "")
    .replace(/[#*_\-[\]()>~`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return stripped.length === 0
}

export function collectMediaUrlsFromContent(text: string) {
  const urls = new Set<string>()
  for (const match of text.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g)) {
    urls.add(match[1])
  }
  for (const match of text.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    urls.add(match[1])
  }
  return urls
}

export function countWordsInMarkdown(text: string) {
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .trim()
  if (!stripped) return 0
  return stripped.split(/\s+/).filter(Boolean).length
}

export type VideoEmbedInfo =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }

export function parseVideoEmbedUrl(href: string | undefined): VideoEmbedInfo | null {
  if (!href) return null
  try {
    const url = new URL(href)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0]
      return id ? { kind: "youtube", id } : null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v")
        return id ? { kind: "youtube", id } : null
      }
      const embed = url.pathname.match(/^\/embed\/([^/?]+)/)
      if (embed?.[1]) return { kind: "youtube", id: embed[1] }
    }

    if (host === "vimeo.com") {
      const id = url.pathname.replace(/^\//, "").split("/")[0]
      return id && /^\d+$/.test(id) ? { kind: "vimeo", id } : null
    }

    if (host === "player.vimeo.com") {
      const m = url.pathname.match(/^\/video\/(\d+)/)
      return m?.[1] ? { kind: "vimeo", id: m[1] } : null
    }
  } catch {
    return null
  }
  return null
}
