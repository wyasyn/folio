import { Resend } from "resend"
import { formatPhoneDisplay } from "@/lib/phone"
import { siteConfig } from "@/lib/site-config"

type ContactBody = {
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  phone?: unknown
  company?: unknown
  subject?: unknown
  message?: unknown
  website?: unknown
}

function asTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > max) return null
  return trimmed
}

function asOptionalTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > max) return null
  return trimmed
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: "Email is not configured on this server." },
      { status: 503 },
    )
  }

  if (!siteConfig.contactToEmail) {
    return Response.json(
      { error: "Contact recipient is not configured." },
      { status: 503 },
    )
  }

  let body: ContactBody
  try {
    body = (await request.json()) as ContactBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return Response.json({ data: { ok: true } })
  }

  const firstName = asTrimmedString(body.firstName, 60)
  const lastName = asTrimmedString(body.lastName, 60)
  const email = asTrimmedString(body.email, 320)
  const phoneRaw = asOptionalTrimmedString(body.phone, 40)
  const phone = phoneRaw ? formatPhoneDisplay(phoneRaw) ?? phoneRaw : null
  const company = asOptionalTrimmedString(body.company, 120)
  const subject = asOptionalTrimmedString(body.subject, 200)
  const message = asTrimmedString(body.message, 5000)

  if (!firstName) {
    return Response.json({ error: "First name is required." }, { status: 400 })
  }
  if (!lastName) {
    return Response.json({ error: "Last name is required." }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "A valid email is required." }, { status: 400 })
  }
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 })
  }

  const fullName = `${firstName} ${lastName}`.trim()
  const emailSubject = subject
    ? `Portfolio contact: ${subject}`
    : `Portfolio contact from ${fullName}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const idempotencyKey = `contact/${email}/${Date.now().toString(36)}`

  const optionalRows = [
    phone ? `<tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>` : "",
    company
      ? `<tr><td><strong>Company</strong></td><td>${escapeHtml(company)}</td></tr>`
      : "",
    subject
      ? `<tr><td><strong>Subject</strong></td><td>${escapeHtml(subject)}</td></tr>`
      : "",
  ].join("")

  const { error } = await resend.emails.send(
    {
      from: siteConfig.contactFromEmail,
      to: [siteConfig.contactToEmail],
      replyTo: email,
      subject: emailSubject,
      html: `
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(fullName)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          ${optionalRows}
        </table>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    },
    { idempotencyKey },
  )

  if (error) {
    return Response.json(
      { error: "Failed to send message. Try again later." },
      { status: 502 },
    )
  }

  return Response.json({ data: { ok: true } })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
