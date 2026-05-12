import db from "@/lib/db"

const DEFAULT_PAGE_SIZE = 10

export type PostListRow = {
  id: number
  slug: string
  title: string
  ownerName: string | null
  ownerEmail: string
  featured: boolean
  published: boolean
  readTime: number
  updatedAt: Date
  _count: { Tag: number }
}

export async function getPostsPage(
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
  const total = await db.post.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / safeSize))
  const clampedPage = Math.min(safePage, totalPages)

  const posts = await db.post.findMany({
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
      user: { select: { name: true, email: true } },
      _count: { select: { Tag: true } },
    },
  })

  return {
    posts: posts.map(({ user, ...post }) => ({
      ...post,
      ownerName: user.name,
      ownerEmail: user.email,
    })),
    total,
    page: clampedPage,
    pageSize: safeSize,
    totalPages,
  }
}

export { DEFAULT_PAGE_SIZE }
