import Link from "next/link"
import { UserRowActions } from "@/components/dashboard/admin/user-row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import db from "@/lib/db"
import { requireAdmin } from "@/lib/authz"
import { getDashboardSectionById } from "@/lib/dashboard-navigation"

type UsersPageProps = {
  searchParams: Promise<{ page?: string; q?: string }>
}

const PAGE_SIZE = 10

function pageHref(page: number, q: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  if (q) params.set("q", q)
  const query = params.toString()
  return query ? `/dashboard/users?${query}` : "/dashboard/users"
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requireAdmin()
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const rawPage = Number.parseInt(params.page ?? "1", 10)
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}
  const total = await db.user.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const resolvedPage = Math.min(page, totalPages)
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (resolvedPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      _count: { select: { Project: true, Post: true, news: true } },
    },
  })
  const section = getDashboardSectionById("users")

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">
          {section.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          Search users, manage roles, block access, and remove accounts when
          needed.
        </p>
      </div>

      <form className="flex max-w-xl gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email"
        />
        <Button type="submit">Search</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user.name ?? "Unnamed user"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role.split(",").includes("admin")
                      ? "default"
                      : "outline"
                  }
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.banned ? "destructive" : "secondary"}>
                  {user.banned ? "Blocked" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {user._count.Project} projects, {user._count.Post} posts,{" "}
                {user._count.news} news
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {user.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <UserRowActions
                  userId={user.id}
                  role={user.role}
                  banned={user.banned}
                  isCurrentUser={user.id === session.user.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {resolvedPage > 1 ? (
                <PaginationPrevious asChild>
                  <Link href={pageHref(resolvedPage - 1, q)}>Previous</Link>
                </PaginationPrevious>
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  Previous
                </Button>
              )}
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-8 items-center px-2 text-sm text-muted-foreground">
                Page {resolvedPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              {resolvedPage < totalPages ? (
                <PaginationNext asChild>
                  <Link href={pageHref(resolvedPage + 1, q)}>Next</Link>
                </PaginationNext>
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  Next
                </Button>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </section>
  )
}
