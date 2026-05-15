import {
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"
import type { ContactInfo } from "@/lib/public/site-profile"

type ContactInformationProps = {
  contact: ContactInfo
}

type ContactRow = {
  icon: typeof IconPhone
  label: string
  value: string
  href?: string
}

export function ContactInformation({ contact }: ContactInformationProps) {
  const rows: ContactRow[] = []

  if (contact.phone) {
    rows.push({
      icon: IconPhone,
      label: "Phone",
      value: contact.phone,
      href: contact.phoneTel ? `tel:${contact.phoneTel}` : undefined,
    })
  }

  if (contact.email) {
    rows.push({
      icon: IconMail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    })
  }

  if (contact.address) {
    rows.push({
      icon: IconMapPin,
      label: "Address",
      value: contact.address,
    })
  }

  if (contact.hours) {
    rows.push({
      icon: IconClock,
      label: "Hours",
      value: contact.hours,
    })
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-heading text-2xl lg:text-4xl font-bold tracking-tight">
          Contact 
        </h2>
        <p className="max-w-md text-muted-foreground leading-relaxed">
          Reach out through any of the channels below. I aim to respond within one
          business day.
        </p>
      </div>

      {rows.length > 0 ? (
        <ul className="space-y-5">
          {rows.map((row) => {
            const Icon = row.icon
            const content = (
              <>
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 pt-1">
                  <span className="sr-only">{row.label}: </span>
                  <span className="text-foreground">{row.value}</span>
                </span>
              </>
            )

            return (
              <li key={row.label}>
                {row.href ? (
                  <a
                    href={row.href}
                    className="flex gap-4 transition-colors hover:text-primary"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex gap-4">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Contact details can be added in your dashboard profile settings.
        </p>
      )}

      {contact.mapEmbedUrl ? (
        <div
          className="overflow-hidden rounded-xl border border-border"
          role="region"
          aria-label="Map"
        >
          <div className="relative aspect-video w-full bg-muted">
            <iframe
              src={contact.mapEmbedUrl}
              title="Location map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
