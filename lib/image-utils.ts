// Photo ko uski asli proportion me rakhte hue sirf zyada badi file ko chhota karta hai
export async function resizeKeepAspect(file: File, maxSide = 1600, quality = 0.92): Promise<File> {
  if (!file.type.startsWith("image/")) return file

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("Could not read image"))
      el.src = url
    })

    const longest = Math.max(img.naturalWidth, img.naturalHeight)

    // Chhoti aur halki photo ko touch hi mat karo
    if (longest <= maxSide && file.size <= 1.5 * 1024 * 1024) return file

    const scale = Math.min(1, maxSide / longest)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)

    const ctx = canvas.getContext("2d")
    if (!ctx) return file

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (!blob) return file

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}