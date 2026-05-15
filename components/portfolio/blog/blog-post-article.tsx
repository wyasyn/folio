import { notFound } from "next/navigation"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import { fetchBlurDataUrl } from "@/lib/cloudinary"
import { getPublishedPostBySlug } from "@/lib/public/posts"

type BlogPostArticleProps = {
  slug: string
}

export async function BlogPostArticle({ slug }: BlogPostArticleProps) {
  const post = await getPublishedPostBySlug(slug)
  if (!post) notFound()

  const coverBlurDataURL = post.coverImage
    ? await fetchBlurDataUrl(post.coverImage)
    : undefined

  return (
    <article className="space-y-8">
      {post.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
          <CloudinaryImage
            src={post.coverImage}
            alt=""
            preset="cover"
            fill
            priority
            blurDataURL={coverBlurDataURL}
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
        {post.description ? (
          <p className="text-lg text-muted-foreground">{post.description}</p>
        ) : null}
        {post.Tag.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.Tag.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {post.user.name ?? "Author"}
          {post.readTime > 0 ? ` · ${post.readTime} min read` : ""}
        </p>
      </header>
      <MarkdownBody markdown={post.content} />
    </article>
  )
}
