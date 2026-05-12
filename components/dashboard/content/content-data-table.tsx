import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { ContentRowActions } from "@/components/dashboard/content/content-row-actions"
import { EmptyContentState } from "@/components/dashboard/content/empty-content-state"

type ContentRow = {
  id: number
  slug: string
  title: string
  ownerName: string | null
  ownerEmail: string
  featured: boolean
  published: boolean
  readTime: number
  updatedAt: Date
  _count: Record<string, number>
}

type ContentDataTableProps = {
  kind: "posts" | "news"
  rows: ContentRow[]
  page: number
  totalPages: number
  total: number
  showOwner?: boolean
}

function pageHref(kind: "posts" | "news", p: number) {
  return p <= 1 ? `/dashboard/${kind}` : `/dashboard/${kind}?page=${p}`
}

function countTags(row: ContentRow) {
  return row._count.Tag ?? row._count.tags ?? 0
}

export function ContentDataTable({
  kind,
  rows,
  page,
  totalPages,
  total,
  showOwner = false,
}: ContentDataTableProps) {
  const label = kind === "posts" ? "post" : "news item"
  if (rows.length === 0) return <EmptyContentState kind={kind} />

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {total} {label}
        {total === 1 ? "" : "s"}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {showOwner ? <TableHead>Owner</TableHead> : null}
            <TableHead>Slug</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Read</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="max-w-[220px] truncate font-medium">
                {row.title}
              </TableCell>
              {showOwner ? (
                <TableCell className="max-w-[180px] truncate text-muted-foreground">
                  {row.ownerName ?? row.ownerEmail}
                </TableCell>
              ) : null}
              <TableCell className="max-w-[140px] truncate text-muted-foreground">
                {row.slug}
              </TableCell>
              <TableCell>
                <Badge variant={row.published ? "default" : "secondary"}>
                  {row.published ? "Live" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={row.featured ? "default" : "outline"}>
                  {row.featured ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {countTags(row)}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.readTime}m
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {row.updatedAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <ContentRowActions
                  kind={kind}
                  itemId={row.id}
                  title={row.title}
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
              {page > 1 ? (
                <PaginationPrevious asChild>
                  <Link href={pageHref(kind, page - 1)}>Previous</Link>
                </PaginationPrevious>
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  Previous
                </Button>
              )}
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-8 items-center px-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              {page < totalPages ? (
                <PaginationNext asChild>
                  <Link href={pageHref(kind, page + 1)}>Next</Link>
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
    </div>
  )
}
