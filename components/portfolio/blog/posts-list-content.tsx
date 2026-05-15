import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getPublishedPosts } from "@/lib/public/posts"

type PostsListContentProps = {
  featuredOnly?: boolean
  emptyMessage?: string
}

export async function PostsListContent({
  featuredOnly = false,
  emptyMessage = "No posts published yet.",
}: PostsListContentProps) {
  const posts = await getPublishedPosts()
  const items = featuredOnly
    ? posts.filter((post) => post.featured).slice(0, 3)
    : posts

  if (featuredOnly && items.length === 0) {
    return null
  }

  return (
    <ContentListGrid
      items={items.map((post) => ({
        id: post.id,
        href: `/blog/${post.slug}`,
        title: post.title,
        description: post.description,
        coverImage: post.coverImage,
        meta: post.readTime > 0 ? `${post.readTime} min read` : undefined,
      }))}
      emptyMessage={emptyMessage}
    />
  )
}
