import { FlipHoverLabel } from "@/components/portfolio/flip-hover-label"
import { HeroQuote } from "@/components/portfolio/hero-quote"
import type { SiteProfile } from "@/lib/public/site-profile"
import { Button } from "../ui/button"
import Link from "next/link"
import { IconBriefcase2, IconMail } from "@tabler/icons-react"

type HeroSectionProps = {
  profile: SiteProfile
}

export function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden  bg-background pb-16 lg:pb-32 ">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 ">
        <div className="grid gap-18  pt-16 lg:pt-40 lg:grid-cols-2 lg:items-end lg:gap-12">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {profile.title}
            </p>
            <h1 className=" font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {profile.name}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {profile.tagline}
            </p>
            {profile.bio ? (
              <p className=" max-w-xl text-base text-muted-foreground/90">
                {profile.bio}
              </p>
            ) : null}
           
          </div>

          <div className="flex gap-2 justify-end" >
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="gap-4 px-6 has-data-[icon=inline-end]:pr-5"
            >
              <Link href="/projects">
                <FlipHoverLabel groupHover="button">
                  View projects
                </FlipHoverLabel>
                <IconBriefcase2 data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-4 px-6 has-data-[icon=inline-end]:pr-5"
            >
              <Link href="/contact">
                <FlipHoverLabel groupHover="button">
                  Get in touch
                </FlipHoverLabel>
                <IconMail data-icon="inline-end" />
              </Link>
            </Button>
           
          </div>
        </div>

        <HeroQuote className="mt-8 md:mt-12 lg:mt-16" />
      </div>
    </section>
  )
}
