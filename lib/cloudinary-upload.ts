type CloudinarySignatureResponse = {
  data?: {
    cloudName: string
    apiKey: string
    timestamp: number
    signature: string
    folder: string
    eager: string
  }
}

export const uploadImageToCloudinary = async (
  file: File,
  options?: {
    signatureEndpoint?: string
    folder?: "projects" | "avatars" | "posts" | "news"
  }
) => {
  const signatureResponse = await fetch(
    options?.signatureEndpoint ?? "/api/uploads/cloudinary-signature",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: options?.folder }),
    }
  )

  if (!signatureResponse.ok) {
    throw new Error("Could not initialize upload.")
  }

  const signatureData =
    (await signatureResponse.json()) as CloudinarySignatureResponse

  if (!signatureData.data) {
    throw new Error("Missing signature payload.")
  }

  const uploadBody = new FormData()
  uploadBody.append("file", file)
  uploadBody.append("api_key", signatureData.data.apiKey)
  uploadBody.append("timestamp", `${signatureData.data.timestamp}`)
  uploadBody.append("signature", signatureData.data.signature)
  uploadBody.append("folder", signatureData.data.folder)
  uploadBody.append("eager", signatureData.data.eager)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.data.cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadBody,
    }
  )

  if (!uploadResponse.ok) {
    throw new Error("Image upload failed.")
  }

  const uploadResult = (await uploadResponse.json()) as {
    secure_url?: string
    eager?: Array<{ secure_url?: string }>
  }

  const eagerUrl = uploadResult.eager?.[0]?.secure_url
  if (eagerUrl) return eagerUrl

  if (!uploadResult.secure_url) {
    throw new Error("Cloudinary did not return image URL.")
  }

  return uploadResult.secure_url
}
