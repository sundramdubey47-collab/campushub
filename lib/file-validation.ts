export const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
]
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

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
  return null
}