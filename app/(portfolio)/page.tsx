import Link from "next/link"
import { HeroSection } from "@/components/portfolio/hero-section"
import { ContentListGrid } from "@/components/portfolio/content-list-grid"
import { getSiteProfile } from "@/lib/public/site-profile"
import { getPublishedPosts } from "@/lib/public/posts"
import { getPublishedNewsList } from "@/lib/public/news"
import { getPublishedProjects } from "@/lib/public/projects"

export const revalidate = 3600

export const metadata = {
  title: "Home",
}

export default async function PortfolioHome() {
  const [profile, posts, news, projects] = await Promise.all([
    getSiteProfile(),
    getPublishedPosts(),
    getPublishedNewsList(),
    getPublishedProjects(),
  ])

  const featuredPosts = posts.filter((p) => p.featured).slice(0, 3)
  const featuredNews = news.filter((n) => n.featured).slice(0, 3)
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <HeroSection profile={profile} />

      {featuredProjects.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured projects</h2>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <ContentListGrid
            items={featuredProjects.map((project) => ({
              id: project.id,
              href: `/projects/${project.slug}`,
              title: project.title,
              description: project.description,
              coverImage: project.coverImage,
            }))}
          />
        </section>
      ) : null}

      {featuredPosts.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured posts</h2>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <ContentListGrid
            items={featuredPosts.map((post) => ({
              id: post.id,
              href: `/blog/${post.slug}`,
              title: post.title,
              description: post.description,
              coverImage: post.coverImage,
            }))}
          />
        </section>
      ) : null}

      {featuredNews.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured news</h2>
            <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <ContentListGrid
            items={featuredNews.map((item) => ({
              id: item.id,
              href: `/news/${item.slug}`,
              title: item.title,
              description: item.description,
              coverImage: item.coverImage,
            }))}
          />
        </section>
      ) : null}
    </main>
  )
}
