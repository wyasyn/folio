import { createHash } from "node:crypto"
import { auth } from "@/lib/auth"

const extractPublicIdFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes("res.cloudinary.com")) return null

    const segments = parsed.pathname.split("/").filter(Boolean)
    const uploadIndex = segments.findIndex((segment) => segment === "upload")
    if (uploadIndex === -1) return null

    const rawPublicIdSegments = segments.slice(uploadIndex + 1)
    if (rawPublicIdSegments[0]?.startsWith("v")) {
      rawPublicIdSegments.shift()
    }

    if (rawPublicIdSegments.length === 0) return null

    const joined = rawPublicIdSegments.join("/")
    return joined.replace(/\.[^.]+$/, "")
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary environment variables are not configured." },
      { status: 500 },
    )
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null
  const publicId = extractPublicIdFromUrl(body?.url ?? "")

  if (!publicId) {
    return Response.json(
      { error: "Invalid Cloudinary URL." },
      { status: 400 },
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const payload = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash("sha1").update(payload).digest("hex")

  const formData = new FormData()
  formData.append("public_id", publicId)
  formData.append("timestamp", `${timestamp}`)
  formData.append("api_key", apiKey)
  formData.append("signature", signature)
  formData.append("invalidate", "true")

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  )

  if (!response.ok) {
    return Response.json(
      { error: "Could not delete image from Cloudinary." },
      { status: 502 },
    )
  }

  return Response.json({ ok: true })
}
