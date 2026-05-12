import { createHash } from "node:crypto"

const ALLOWED_FOLDERS = new Set(["projects", "avatars"])

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary environment variables are not configured." },
      { status: 500 },
    )
  }

  const body = (await request.json().catch(() => null)) as { folder?: string } | null
  const folder =
    body?.folder && ALLOWED_FOLDERS.has(body.folder) ? body.folder : "projects"

  const timestamp = Math.floor(Date.now() / 1000)
  const payload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash("sha1").update(payload).digest("hex")

  return Response.json({
    data: {
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    },
  })
}
