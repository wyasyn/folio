import { getPortfolioSearchIndex } from "@/lib/portfolio/search-index"

export const revalidate = 3600

export async function GET() {
  const items = await getPortfolioSearchIndex()
  return Response.json({ items })
}
