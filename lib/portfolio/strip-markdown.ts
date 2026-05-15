/** Plain text for search/snippets — not full markdown parsing. */
export function stripMarkdownForSearch(value: string, maxLength = 400) {
  const plain = value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_~>`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength)}…`
}
