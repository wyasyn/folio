"use client"

import { useState } from "react"
import {
  IconBuilding,
  IconLoader,
  IconMail,
  IconSend,
  IconMessage,
  IconPhone,
  IconTag,
  IconUser,
} from "@tabler/icons-react"
import { ContactField } from "@/components/portfolio/contact/contact-field"
import { Button } from "@/components/ui/button"

export function ContactForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  )
  const [errorMessage, setErrorMessage] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          company,
          subject,
          message,
          website,
        }),
      })

      const body = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        setStatus("error")
        setErrorMessage(body?.error ?? "Could not send your message.")
        return
      }

      setStatus("success")
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setCompany("")
      setSubject("")
      setMessage("")
      setWebsite("")
    } catch {
      setStatus("error")
      setErrorMessage("Network error. Please try again.")
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3 lg:mt-12">
       
        <p className="text-muted-foreground leading-relaxed">
          Fill out the form and I will get back to you within 24 hours.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <ContactField
            id="contact-first-name"
            name="firstName"
            label="First name"
            icon={IconUser}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            required
            maxLength={60}
            autoComplete="given-name"
          />
          <ContactField
            id="contact-last-name"
            name="lastName"
            label="Last name"
            icon={IconUser}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            required
            maxLength={60}
            autoComplete="family-name"
          />
          <ContactField
            id="contact-email"
            name="email"
            type="email"
            label="Email"
            icon={IconMail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
            maxLength={320}
            autoComplete="email"
          />
          <ContactField
            id="contact-phone"
            name="phone"
            type="tel"
            label="Phone"
            icon={IconPhone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            maxLength={40}
            autoComplete="tel"
          />
          <ContactField
            id="contact-company"
            name="company"
            label="Company name"
            icon={IconBuilding}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name"
            maxLength={120}
            autoComplete="organization"
          />
          <ContactField
            id="contact-subject"
            name="subject"
            label="Subject"
            icon={IconTag}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            maxLength={200}
          />
        </div>

        <ContactField
          id="contact-message"
          name="message"
          label="Message"
          icon={IconMessage}
          multiline
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type here . . ."
          required
          rows={6}
          maxLength={5000}
        />

        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          aria-hidden
        />

        {status === "success" ? (
          <p className="text-sm text-green-600 dark:text-green-400" role="status">
            Thanks — your message was sent.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={status === "loading"}
          className="w-full sm:w-auto"
        >
          {status === "loading" ? (
            <>
              <IconLoader
                className="size-4 animate-spin"
                data-icon="inline-start"
                aria-hidden
              />
              Sending…
            </>
          ) : (
            <>
              Send message
              <IconSend className="size-4" data-icon="inline-end" aria-hidden />
            </>
          )}
        </Button>
      </form>
    </section>
  )
}
