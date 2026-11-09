// Cloudinary URL ko "force download" URL me badalta hai (browser me khulne ki jagah save hota hai)
export function toDownloadUrl(url: string, filename?: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url

  const safe = (filename ?? "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60)

  const flag = safe ? `fl_attachment:${safe}` : "fl_attachment"
  return url.replace("/upload/", `/upload/${flag}/`)
}

export function triggerDownload(url: string, filename?: string) {
  const a = document.createElement("a")
  a.href = toDownloadUrl(url, filename)
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}