import Link from "next/link"
import { Suspense } from "react"
import { BlogPostArticle } from "@/components/portfolio/blog/blog-post-article"
import { RelatedBlogPosts } from "@/components/portfolio/blog/related-blog-posts"
import { BlogPostDetailSkeleton } from "@/components/portfolio/skeletons/blog-post-detail-skeleton"
import { ContentListGridSkeleton } from "@/components/portfolio/skeletons/content-list-grid-skeleton"
import {
  getPublishedPostBySlug,
  getPublishedPostSlugs,
} from "@/lib/public/posts"
import { IconArrowLeft } from "@tabler/icons-react"

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

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/blog"
        className="mb-8 gap-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft data-icon="inline-start" /> Blog
      </Link>
      <Suspense fallback={<BlogPostDetailSkeleton />}>
        <BlogPostArticle slug={slug} />
      </Suspense>
      <Suspense fallback={<ContentListGridSkeleton count={3} className="mt-16" />}>
        <RelatedBlogPosts slug={slug} />
      </Suspense>
    </main>
  )
}
