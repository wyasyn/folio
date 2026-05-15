import { RelatedContentSection } from "@/components/portfolio/related-content-section"
import { getRelatedPostsBySlug } from "@/lib/public/posts"

type RelatedBlogPostsProps = {
  slug: string
}

export async function RelatedBlogPosts({ slug }: RelatedBlogPostsProps) {
  const posts = await getRelatedPostsBySlug(slug)

  return (
    <RelatedContentSection
      title="Related posts"
      items={posts.map((post) => ({
        id: post.id,
        href: `/blog/${post.slug}`,
        title: post.title,
        description: post.description,
        coverImage: post.coverImage,
        meta: post.readTime > 0 ? `${post.readTime} min read` : undefined,
      }))}
    />
  )
}
