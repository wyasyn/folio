import Link from "next/link"
import { notFound } from "next/navigation"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { MarkdownBody } from "@/components/dashboard/content/markdown-body"
import {
  getPublishedNewsBySlug,
  getPublishedNewsSlugs,
} from "@/lib/public/news"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const rows = await getPublishedNewsSlugs()
  return rows.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const item = await getPublishedNewsBySlug(slug)
  if (!item) return { title: "News not found" }
  return {
    title: item.title,
    description: item.description ?? undefined,
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getPublishedNewsBySlug(slug)
  if (!item) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/news"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← News
      </Link>
      <article className="space-y-8">
        {item.coverImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
            <CloudinaryImage
              src={item.coverImage}
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
            {item.title}
          </h1>
          {item.description ? (
            <p className="text-lg text-muted-foreground">{item.description}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {item.author.name ?? "Author"}
            {item.readTime > 0 ? ` · ${item.readTime} min read` : ""}
          </p>
        </header>
        <MarkdownBody markdown={item.content} />
      </article>
    </main>
  )
}
