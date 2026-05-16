const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp|telegram|discord|preview|headless|lighthouse|pagespeed|wget|curl|python-requests|go-http|java\/|scrapy/i

export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent?.trim()) return false
  return BOT_PATTERN.test(userAgent)
}
