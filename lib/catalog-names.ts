/** Case-insensitive helpers for tag / tech-stack catalog pickers. */

export function findCanonicalCatalogName(
  candidate: string,
  catalog: readonly string[]
): string {
  const trimmed = candidate.trim()
  if (!trimmed) return ""
  const match = catalog.find(
    (name) => name.toLowerCase() === trimmed.toLowerCase()
  )
  return match ?? trimmed
}

export function isCatalogNameInList(
  list: readonly string[],
  candidate: string
): boolean {
  const lower = candidate.trim().toLowerCase()
  if (!lower) return false
  return list.some((item) => item.toLowerCase() === lower)
}

/** Map selections to catalog names when they exist; dedupe case-insensitively. */
export function resolveCatalogSelections(
  selections: readonly string[],
  catalog: readonly string[]
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of selections) {
    const canonical = findCanonicalCatalogName(raw, catalog)
    if (!canonical) continue
    const key = canonical.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(canonical)
  }

  return result
}

export function mergeCatalogOptions(
  catalog: readonly string[],
  selected: readonly string[] = []
): string[] {
  return Array.from(new Set([...catalog, ...selected])).sort((a, b) =>
    a.localeCompare(b)
  )
}
