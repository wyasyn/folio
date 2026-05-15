import { Resend } from "resend"
import { siteConfig } from "@/lib/site-config"

type ContactBody = {
  name?: unknown
  email?: unknown
  message?: unknown
  website?: unknown
}

function asTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > max) return null
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

  const name = asTrimmedString(body.name, 120)
  const email = asTrimmedString(body.email, 320)
  const message = asTrimmedString(body.message, 5000)

  if (!name) {
    return Response.json({ error: "Name is required." }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "A valid email is required." }, { status: 400 })
  }
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const idempotencyKey = `contact/${email}/${Date.now().toString(36)}`

  const { error } = await resend.emails.send(
    {
      from: siteConfig.contactFromEmail,
      to: [siteConfig.contactToEmail],
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
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
