import { ContactForm } from "@/components/portfolio/contact/contact-form"
import { ContactInformation } from "@/components/portfolio/contact/contact-information"
import { getContactInfo } from "@/lib/public/site-profile"
import { createPageMetadata } from "@/lib/seo/metadata"

export const revalidate = 3600

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch — questions, collaborations, or just saying hello.",
  path: "/contact",
})

export default async function ContactPage() {
  const contact = await getContactInfo()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
        <ContactInformation contact={contact} />
        <ContactForm />
      </div>
    </main>
  )
}
