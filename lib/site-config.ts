function trimOrUndefined(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

export const siteConfig = {
  name: process.env.SITE_OWNER_NAME?.trim() || "Your Name",
  title: process.env.SITE_OWNER_TITLE?.trim() || "Full-stack Developer",
  tagline:
    process.env.SITE_OWNER_TAGLINE?.trim() ||
    "I build fast, accessible web experiences with modern tooling.",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  contactToEmail: trimOrUndefined(process.env.CONTACT_TO_EMAIL),
  contactFromEmail:
    trimOrUndefined(process.env.RESEND_FROM_EMAIL) ||
    "Portfolio <onboarding@resend.dev>",
  ownerUserId: trimOrUndefined(process.env.SITE_OWNER_USER_ID),
} as const
