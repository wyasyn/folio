import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { isAllowedMapEmbedUrl } from "@/lib/contact-map"
import { normalizePhone } from "@/lib/phone"
import { revalidateSiteProfile } from "@/lib/revalidate-content"

type UpdateProfilePayload = {
  name?: unknown
  jobTitle?: unknown
  tagline?: unknown
  bio?: unknown
  location?: unknown
  image?: unknown
  website?: unknown
  github?: unknown
  linkedin?: unknown
  twitter?: unknown
  publicEmail?: unknown
  publicPhone?: unknown
  contactHours?: unknown
  mapEmbedUrl?: unknown
  resumeUrl?: unknown
  openToWork?: unknown
}

const asOptionalTrimmedString = (
  value: unknown,
  maxLength: number,
): string | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > maxLength) return undefined
  return trimmed
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.id || typeof session.user.id !== "string") {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  let payload: UpdateProfilePayload

  try {
    payload = (await request.json()) as UpdateProfilePayload
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const name = asOptionalTrimmedString(payload.name, 100)
  const jobTitle = asOptionalTrimmedString(payload.jobTitle, 100)
  const tagline = asOptionalTrimmedString(payload.tagline, 120)
  const bio = asOptionalTrimmedString(payload.bio, 280)
  const location = asOptionalTrimmedString(payload.location, 120)
  const image = asOptionalTrimmedString(payload.image, 500)
  const website = asOptionalTrimmedString(payload.website, 500)
  const github = asOptionalTrimmedString(payload.github, 500)
  const linkedin = asOptionalTrimmedString(payload.linkedin, 500)
  const twitter = asOptionalTrimmedString(payload.twitter, 500)
  const publicEmail = asOptionalTrimmedString(payload.publicEmail, 320)
  const publicPhoneRaw = asOptionalTrimmedString(payload.publicPhone, 40)
  const publicPhone =
    publicPhoneRaw === undefined
      ? undefined
      : publicPhoneRaw === null
        ? null
        : normalizePhone(publicPhoneRaw) ?? publicPhoneRaw
  const contactHours = asOptionalTrimmedString(payload.contactHours, 200)
  const mapEmbedUrlRaw = asOptionalTrimmedString(payload.mapEmbedUrl, 800)
  const mapEmbedUrl =
    mapEmbedUrlRaw === undefined
      ? undefined
      : mapEmbedUrlRaw === null
        ? null
        : isAllowedMapEmbedUrl(mapEmbedUrlRaw)
          ? mapEmbedUrlRaw
          : undefined
  const resumeUrl = asOptionalTrimmedString(payload.resumeUrl, 500)
  const openToWork =
    payload.openToWork === undefined
      ? undefined
      : typeof payload.openToWork === "boolean"
        ? payload.openToWork
        : null

  if (
    name === undefined ||
    jobTitle === undefined ||
    tagline === undefined ||
    bio === undefined ||
    location === undefined ||
    image === undefined ||
    website === undefined ||
    github === undefined ||
    linkedin === undefined ||
    twitter === undefined ||
    publicEmail === undefined ||
    publicPhone === undefined ||
    contactHours === undefined ||
    mapEmbedUrl === undefined ||
    resumeUrl === undefined ||
    openToWork === null
  ) {
    return Response.json(
      {
        error:
          "Invalid profile payload. Ensure all values are strings within allowed lengths and map embed URLs use a valid Google Maps embed link.",
      },
      { status: 400 },
    )
  }

  try {
    const user = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        jobTitle,
        tagline,
        bio,
        location,
        image,
        website,
        github,
        linkedin,
        twitter,
        publicEmail,
        publicPhone,
        contactHours,
        mapEmbedUrl,
        resumeUrl,
        openToWork,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        tagline: true,
        bio: true,
        location: true,
        image: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        publicEmail: true,
        publicPhone: true,
        contactHours: true,
        mapEmbedUrl: true,
        resumeUrl: true,
        openToWork: true,
      },
    })

    revalidateSiteProfile()

    return Response.json({ data: user }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update profile." }, { status: 500 })
  }
}
