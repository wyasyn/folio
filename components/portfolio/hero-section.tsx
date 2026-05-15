import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import type { SiteProfile } from "@/lib/public/site-profile"

type HeroSectionProps = {
  profile: SiteProfile
}

export function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Portfolio
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {profile.name}
        </h1>
        <p className="text-xl font-medium text-foreground/90 md:text-2xl">
          {profile.title}
        </p>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {profile.tagline}
        </p>
      </div>
      {profile.image ? (
        <div className="relative mx-auto size-32 shrink-0 overflow-hidden rounded-full border border-border bg-muted md:mx-0 md:size-40">
          <CloudinaryImage
            src={profile.image}
            alt=""
            preset="avatar"
            fill
            sizes="160px"
            priority
            className="object-cover"
          />
        </div>
      ) : null}
    </section>
  )
}
