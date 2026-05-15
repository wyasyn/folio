import { notFound } from "next/navigation"
import {
  ContentForm,
  type ContentFormInitial,
} from "@/components/dashboard/content/content-form"
import db from "@/lib/db"
import { getDashboardSession, isAdmin } from "@/lib/authz"

type EditNewsPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id: idParam } = await params
  const newsId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(newsId) || newsId < 1) notFound()

  const session = await getDashboardSession()
  const news = await db.news.findFirst({
    where: {
      id: newsId,
      ...(isAdmin(session.user) ? {} : { authorId: session.user.id }),
    },
    include: { tags: { select: { name: true } } },
  })

  if (!news) notFound()

  const tags = await db.tag.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  const initial: ContentFormInitial = {
    title: news.title,
    description: news.description ?? "",
    content: news.content,
    coverImage: news.coverImage ?? "",
    readTime: news.readTime,
    published: news.published,
    featured: news.featured,
    tags: news.tags.map((tag) => tag.name),
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-4xl font-semibold text-foreground">Edit news</h1>
        <p className="text-sm text-muted-foreground">
          Update this announcement, tags, cover image, and visibility.
        </p>
      </div>
      <ContentForm
        kind="news"
        mode="edit"
        userId={session.user.id}
        itemId={news.id}
        tagOptions={tags.map((tag) => tag.name)}
        initial={initial}
      />
    </section>
  )
}
