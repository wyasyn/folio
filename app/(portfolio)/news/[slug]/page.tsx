import Link from "next/link"
import { Suspense } from "react"
import { JsonLd } from "@/components/seo/json-ld"
import { NewsArticle } from "@/components/portfolio/news/news-article"
import { RelatedNewsItems } from "@/components/portfolio/news/related-news-items"
import { BlogPostDetailSkeleton } from "@/components/portfolio/skeletons/blog-post-detail-skeleton"
import { ContentListGridSkeleton } from "@/components/portfolio/skeletons/content-list-grid-skeleton"
import {
  getPublishedNewsBySlug,
  getPublishedNewsSlugs,
} from "@/lib/public/news"
import { createContentJsonLd } from "@/lib/seo/json-ld"
import { createContentMetadata } from "@/lib/seo/metadata"
import { siteConfig } from "@/lib/site-config"
import { IconArrowLeft } from "@tabler/icons-react"

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
  return createContentMetadata({
    type: "news",
    title: item.title,
    description: item.description ?? siteConfig.description,
    path: `/news/${slug}`,
    coverImage: item.coverImage,
    publishedAt: item.createdAt,
    modifiedAt: item.updatedAt,
  })
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getPublishedNewsBySlug(slug)

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {item ? (
        <JsonLd
          data={createContentJsonLd({
            type: "news",
            title: item.title,
            description: item.description ?? siteConfig.description,
            path: `/news/${slug}`,
            coverImage: item.coverImage,
            publishedAt: item.createdAt,
            modifiedAt: item.updatedAt,
            authorName: item.author.name,
          })}
        />
      ) : null}
      <Link
        href="/news"
        className="mb-8 gap-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft data-icon="inline-start" /> News
      </Link>
      <Suspense fallback={<BlogPostDetailSkeleton />}>
        <NewsArticle slug={slug} />
      </Suspense>
      <Suspense fallback={<ContentListGridSkeleton count={3} className="mt-16" />}>
        <RelatedNewsItems slug={slug} />
      </Suspense>
    </main>
  )
}
