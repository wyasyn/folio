import { notFound } from "next/navigation"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import { fetchBlurDataUrl } from "@/lib/cloudinary"
import { getPublishedNewsBySlug } from "@/lib/public/news"

type NewsArticleProps = {
  slug: string
}

export async function NewsArticle({ slug }: NewsArticleProps) {
  const item = await getPublishedNewsBySlug(slug)
  if (!item) notFound()

  const coverBlurDataURL = item.coverImage
    ? await fetchBlurDataUrl(item.coverImage)
    : undefined

  return (
    <article className="space-y-8">
      {item.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
          <CloudinaryImage
            src={item.coverImage}
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
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{item.title}</h1>
        {item.description ? (
          <p className="text-lg text-muted-foreground">{item.description}</p>
        ) : null}
        {item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
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
          {item.author.name ?? "Author"}
          {item.readTime > 0 ? ` · ${item.readTime} min read` : ""}
        </p>
      </header>
      <MarkdownBody markdown={item.content} />
    </article>
  )
}
