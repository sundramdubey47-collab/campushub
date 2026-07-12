export const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
]
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

// File signatures (magic numbers) — asli file content check karne ke liye,
// sirf naam/extension par bharosa nahi karte
const FILE_SIGNATURES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/jpg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
}

export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number = MAX_FILE_SIZE
): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `File type "${file.type}" is not allowed`
  }
  if (file.size > maxSize) {
    return `File is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`
  }
  if (file.size === 0) {
    return "File appears to be empty"
  }
  return null
}

// Asli file bytes check karta hai — buffer already server par mil chuka hoga
export function validateFileSignature(buffer: Buffer, declaredType: string): boolean {
  const signatures = FILE_SIGNATURES[declaredType]
  if (!signatures) return true // Agar signature list me nahi hai, skip (par upar wala type-check to laga hi hai)

  return signatures.some((signature) =>
    signature.every((byte, index) => buffer[index] === byte)
  )
}