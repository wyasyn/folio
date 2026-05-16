import { Suspense } from "react"
import { JsonLd } from "@/components/seo/json-ld"
import { HeroSection } from "@/components/portfolio/hero-section"
import { FeaturedPostsSection } from "@/components/portfolio/blog/featured-posts-section"
import { HomeFeaturedSections } from "@/components/portfolio/home/home-featured-sections"
import { FeaturedNewsSection } from "@/components/portfolio/news/featured-news-section"
import { FeaturedProjectsSection } from "@/components/portfolio/projects/featured-projects-section"
import { FeaturedSectionSkeleton } from "@/components/portfolio/skeletons/featured-section-skeleton"
import { getSiteProfile } from "@/lib/public/site-profile"
import { createWebSiteJsonLd } from "@/lib/seo/json-ld"
import { createHomeMetadata } from "@/lib/seo/metadata"

export const revalidate = 3600

export const metadata = createHomeMetadata()

export default async function PortfolioHome() {
  const profile = await getSiteProfile()

  return (
    <main>
      <JsonLd data={createWebSiteJsonLd()} />
      <HeroSection profile={profile} />

      <HomeFeaturedSections
        projects={
          <Suspense
            fallback={<FeaturedSectionSkeleton title="Featured projects" />}
          >
            <FeaturedProjectsSection />
          </Suspense>
        }
        posts={
          <Suspense
            fallback={<FeaturedSectionSkeleton title="Featured posts" />}
          >
            <FeaturedPostsSection />
          </Suspense>
        }
        news={
          <Suspense
            fallback={<FeaturedSectionSkeleton title="Featured news" />}
          >
            <FeaturedNewsSection />
          </Suspense>
        }
      />
    </main>
  )
}
