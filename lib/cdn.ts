// Cloudinary par automatic format (WebP/AVIF) aur quality, upscaling nahi
export function optimizedUrl(url: string, width = 1000) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url
  if (/\/upload\/[^/]*(f_auto|fl_attachment)/.test(url)) return url
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}