import { ContactForm } from "@/components/portfolio/contact-form"

export const revalidate = 3600

export const metadata = {
  title: "Contact",
  description: "Get in touch.",
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-muted-foreground">
          Send a message and I will get back to you by email.
        </p>
      </header>
      <ContactForm />
    </main>
  )
}
