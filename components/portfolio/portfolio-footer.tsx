import type { ComponentType } from "react"
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconMail,
  IconWorld,
} from "@tabler/icons-react"
import { getSiteProfile, type SiteSocialLink } from "@/lib/public/site-profile"

const socialIcons: Record<
  SiteSocialLink["kind"],
  ComponentType<{ className?: string }>
> = {
  website: IconWorld,
  github: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  twitter: IconBrandX,
  email: IconMail,
}

export async function PortfolioFooter() {
  const profile = await getSiteProfile()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {year} {profile.name}
        </p>
        {profile.socialLinks.length > 0 ? (
          <nav
            className="flex items-center gap-3"
            aria-label="Social links"
          >
            {profile.socialLinks.map((link) => {
              const Icon = socialIcons[link.kind]
              const isExternal = link.kind !== "email"
              return (
                <a
                  key={link.kind}
                  href={link.href}
                  aria-label={link.label}
                  {...(isExternal
                    ? {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {})}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-5" aria-hidden />
                </a>
              )
            })}
          </nav>
        ) : null}
      </div>
    </footer>
  )
}
