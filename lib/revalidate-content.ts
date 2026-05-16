import { revalidatePath, revalidateTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache/tags"

const REVALIDATE_PROFILE = "max" as const

function revalidateSearchAndAi() {
  revalidateTag(CACHE_TAGS.searchIndex, REVALIDATE_PROFILE)
}

function revalidateSitemap() {
  revalidateTag(CACHE_TAGS.sitemap, REVALIDATE_PROFILE)
  revalidatePath("/sitemap.xml")
}

export function revalidatePost(slug: string, previousSlug?: string) {
  revalidateTag(CACHE_TAGS.posts, REVALIDATE_PROFILE)
  revalidateTag(CACHE_TAGS.post(slug), REVALIDATE_PROFILE)
  revalidateSearchAndAi()
  revalidateSitemap()
  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(CACHE_TAGS.post(previousSlug), REVALIDATE_PROFILE)
    revalidatePath(`/blog/${previousSlug}`)
  }
}

export function revalidateNews(slug: string, previousSlug?: string) {
  revalidateTag(CACHE_TAGS.news, REVALIDATE_PROFILE)
  revalidateTag(CACHE_TAGS.newsItem(slug), REVALIDATE_PROFILE)
  revalidateSearchAndAi()
  revalidateSitemap()
  revalidatePath("/news")
  revalidatePath(`/news/${slug}`)
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(CACHE_TAGS.newsItem(previousSlug), REVALIDATE_PROFILE)
    revalidatePath(`/news/${previousSlug}`)
  }
}

export function revalidateProject(slug: string, previousSlug?: string) {
  revalidateTag(CACHE_TAGS.projects, REVALIDATE_PROFILE)
  revalidateTag(CACHE_TAGS.project(slug), REVALIDATE_PROFILE)
  revalidateSearchAndAi()
  revalidateSitemap()
  revalidatePath("/projects")
  revalidatePath(`/projects/${slug}`)
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(CACHE_TAGS.project(previousSlug), REVALIDATE_PROFILE)
    revalidatePath(`/projects/${previousSlug}`)
  }
}

export function revalidateSiteProfile() {
  revalidateTag(CACHE_TAGS.siteProfile, REVALIDATE_PROFILE)
  revalidateTag(CACHE_TAGS.searchIndex, REVALIDATE_PROFILE)
  revalidateSitemap()
}

export function revalidatePortfolioSearch() {
  revalidateTag(CACHE_TAGS.searchIndex, REVALIDATE_PROFILE)
}
