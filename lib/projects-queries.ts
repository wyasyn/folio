import db from "@/lib/db"

const DEFAULT_PAGE_SIZE = 10

export type ProjectListRow = {
  id: number
  slug: string
  title: string
  ownerName: string | null
  ownerEmail: string
  featured: boolean
  published: boolean
  updatedAt: Date
  _count: { TechStack: number; screenshots: number }
}

export async function getProjectsPage(
  userId: string,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  options: { includeAll?: boolean } = {}
): Promise<{
  projects: ProjectListRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
  const safeSize =
    Number.isFinite(pageSize) && pageSize >= 1 && pageSize <= 50
      ? Math.floor(pageSize)
      : DEFAULT_PAGE_SIZE

  const where = options.includeAll ? {} : { userId }
  const total = await db.project.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / safeSize))
  const clampedPage = Math.min(safePage, totalPages)
  const skip = (clampedPage - 1) * safeSize

  const projects = await db.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip,
    take: safeSize,
    select: {
      id: true,
      slug: true,
      title: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      featured: true,
      published: true,
      updatedAt: true,
      _count: {
        select: { TechStack: true, screenshots: true },
      },
    },
  })

  return {
    projects: projects.map((project) => ({
      ...project,
      ownerName: project.user.name,
      ownerEmail: project.user.email,
    })),
    total,
    page: clampedPage,
    pageSize: safeSize,
    totalPages,
  }
}

export { DEFAULT_PAGE_SIZE }
