import { Suspense } from "react"
import { HeroSection } from "@/components/portfolio/hero-section"
import { FeaturedPostsSection } from "@/components/portfolio/blog/featured-posts-section"
import { FeaturedNewsSection } from "@/components/portfolio/news/featured-news-section"
import { FeaturedProjectsSection } from "@/components/portfolio/projects/featured-projects-section"
import { FeaturedSectionSkeleton } from "@/components/portfolio/skeletons/featured-section-skeleton"
import { getSiteProfile } from "@/lib/public/site-profile"

export const revalidate = 3600

export const metadata = {
  title: "Home",
}

export default async function PortfolioHome() {
  const profile = await getSiteProfile()

  return (
    <main className="space-y-16">
      <HeroSection profile={profile} />

      <div className="mx-auto max-w-6xl space-y-16 px-4 pb-12">
        <Suspense fallback={<FeaturedSectionSkeleton title="Featured projects" />}>
          <FeaturedProjectsSection />
        </Suspense>

        <Suspense fallback={<FeaturedSectionSkeleton title="Featured posts" />}>
          <FeaturedPostsSection />
        </Suspense>

        <Suspense fallback={<FeaturedSectionSkeleton title="Featured news" />}>
          <FeaturedNewsSection />
        </Suspense>
      </div>
    </main>
  )
}
