import Link from "next/link"
import { notFound } from "next/navigation"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import {
  getPublishedPostBySlug,
  getPublishedPostSlugs,
} from "@/lib/public/posts"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const rows = await getPublishedPostSlugs()
  return rows.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) return { title: "Post not found" }
  return {
    title: post.title,
    description: post.description ?? undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/blog"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Blog
      </Link>
      <article className="space-y-8">
        {post.coverImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
            <CloudinaryImage
              src={post.coverImage}
              alt=""
              preset="cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        ) : null}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          {post.description ? (
            <p className="text-lg text-muted-foreground">{post.description}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {post.user.name ?? "Author"}
            {post.readTime > 0 ? ` · ${post.readTime} min read` : ""}
          </p>
        </header>
        <MarkdownBody markdown={post.content} />
      </article>
    </main>
  )
}
