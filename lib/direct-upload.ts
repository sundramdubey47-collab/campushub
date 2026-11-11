export const MAX_DIRECT_UPLOAD_BYTES = 10 * 1024 * 1024 // Cloudinary free plan ki limit

// File seedha browser se Cloudinary jaati hai, server ke through nahi
export async function uploadToCloudinary(
  file: File,
  folder: "campushub-notes",
  onProgress?: (percent: number) => void
): Promise<string> {
  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  })
  const sign = await signRes.json()
  if (!signRes.ok) throw new Error(sign.error || "Could not start the upload")

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", sign.apiKey)
  form.append("timestamp", String(sign.timestamp))
  form.append("signature", sign.signature)
  form.append("folder", sign.folder)
  form.append("allowed_formats", sign.allowedFormats)

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      let data: any = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {}

      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) resolve(data.secure_url)
      else reject(new Error(data?.error?.message || "Upload failed. Please try again."))
    }

    xhr.onerror = () => reject(new Error("Network error. Check your internet and try again."))
    xhr.send(form)
  })
}