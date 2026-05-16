import { createHash } from "node:crypto"

export function hashAnalyticsSessionKey(
  clientSessionKey: string,
  ip: string | null,
  userAgent: string | null
): string {
  const material = `${clientSessionKey}|${ip ?? ""}|${userAgent ?? ""}`
  return createHash("sha256").update(material).digest("hex").slice(0, 32)
}
