export type RssItem = {
  title: string
  link: string
  pubDate: Date | string
  description?: string | null
}

export type BuildRssOptions = {
  channelTitle: string
  channelLink: string
  channelDescription: string
  selfHref: string
  items: RssItem[]
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function buildRssResponse({
  channelTitle,
  channelLink,
  channelDescription,
  selfHref,
  items,
}: BuildRssOptions) {
  const itemXml = items
    .map((item) => {
      const pubDate = new Date(item.pubDate).toUTCString()
      const description = item.description?.trim() ?? ""
      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en</language>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml" />
    ${itemXml}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
