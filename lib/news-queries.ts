import db from "@/lib/db"

const DEFAULT_PAGE_SIZE = 10

export type NewsListRow = {
  id: number
  slug: string
  title: string
  ownerName: string | null
  ownerEmail: string
  featured: boolean
  published: boolean
  readTime: number
  updatedAt: Date
  _count: { tags: number }
}

export async function getNewsPage(
  userId: string,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  options: { includeAll?: boolean } = {}
) {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
  const safeSize =
    Number.isFinite(pageSize) && pageSize >= 1 && pageSize <= 50
      ? Math.floor(pageSize)
      : DEFAULT_PAGE_SIZE
  const where = options.includeAll ? {} : { authorId: userId }
  const total = await db.news.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / safeSize))
  const clampedPage = Math.min(safePage, totalPages)

  const news = await db.news.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (clampedPage - 1) * safeSize,
    take: safeSize,
    select: {
      id: true,
      slug: true,
      title: true,
      featured: true,
      published: true,
      readTime: true,
      updatedAt: true,
      author: { select: { name: true, email: true } },
      _count: { select: { tags: true } },
    },
  })

  return {
    news: news.map(({ author, ...item }) => ({
      ...item,
      ownerName: author.name,
      ownerEmail: author.email,
    })),
    total,
    page: clampedPage,
    pageSize: safeSize,
    totalPages,
  }
}

export { DEFAULT_PAGE_SIZE }
