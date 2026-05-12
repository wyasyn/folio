import { notFound } from "next/navigation"
import {
  ContentForm,
  type ContentFormInitial,
} from "@/components/dashboard/content/content-form"
import db from "@/lib/db"
import { getDashboardSession, isAdmin } from "@/lib/authz"

type EditPostPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id: idParam } = await params
  const postId = Number.parseInt(idParam, 10)
  if (!Number.isFinite(postId) || postId < 1) notFound()

  const session = await getDashboardSession()
  const post = await db.post.findFirst({
    where: {
      id: postId,
      ...(isAdmin(session.user) ? {} : { authorId: session.user.id }),
    },
    include: { Tag: { select: { name: true } } },
  })

  if (!post) notFound()

  const tags = await db.tag.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  const initial: ContentFormInitial = {
    title: post.title,
    description: post.description ?? "",
    content: post.content,
    coverImage: post.coverImage ?? "",
    readTime: post.readTime,
    published: post.published,
    featured: post.featured,
    tags: post.Tag.map((tag) => tag.name),
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl text-foreground">Edit post</h1>
        <p className="text-sm text-muted-foreground">
          Update the article content, tags, cover image, and visibility.
        </p>
      </div>
      <ContentForm
        kind="posts"
        mode="edit"
        userId={session.user.id}
        itemId={post.id}
        tagOptions={tags.map((tag) => tag.name)}
        initial={initial}
      />
    </section>
  )
}
