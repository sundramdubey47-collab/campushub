import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { validateFile, validateFileSignature, ALLOWED_IMAGE_TYPES } from "@/lib/file-validation"
import { VENDOR_TYPES, DIETS } from "@/lib/food-shared"

export type FoodUser = { id: number; name: string; role: string; collegeId: number | null }

export async function getFoodUser(): Promise<FoodUser | null> {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, role: true, collegeId: true },
  })
}

export function isFoodAdmin(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export function canManageVendor(user: FoodUser, vendor: { managerId: number | null; collegeId: number }) {
  if (user.role === "SUPER_ADMIN") return true
  if (user.collegeId !== vendor.collegeId) return false
  return user.role === "ADMIN" || vendor.managerId === user.id
}

export function cleanPhone(input: string | null | undefined): string | null {
  if (!input) return null
  const digits = input.replace(/\D/g, "").slice(-10)
  return digits.length === 10 ? digits : null
}

const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format")
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()
const optionalInt = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(max).nullable().optional()
  )

export const vendorSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  type: z.enum(VENDOR_TYPES),
  description: optionalText(500),
  area: optionalText(100),
  address: optionalText(250),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  whatsapp: optionalText(20),
  openTime: timeField.nullable().optional(),
  closeTime: timeField.nullable().optional(),
  isVegOnly: z.boolean().optional(),
  hasDelivery: z.boolean().optional(),
  deliveryNote: optionalText(200),
  monthlyPrice: optionalInt(100000),
  trialMealPrice: optionalInt(10000),
  weeklyMenu: optionalText(2000),
})

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Dish name is too short").max(100),
  description: optionalText(300),
  price: z.preprocess((v) => Number(v), z.number().int().min(1, "Price must be at least ₹1").max(100000)),
  diet: z.enum(DIETS),
  category: optionalText(50),
  isAvailable: z.boolean().optional(),
  isSpecial: z.boolean().optional(),
})

const BOOLEAN_KEYS = ["isVegOnly", "hasDelivery"]

export function formToObject(fd: FormData) {
  const obj: Record<string, unknown> = {}
  fd.forEach((value, key) => {
    if (typeof value !== "string") return
    if (BOOLEAN_KEYS.includes(key)) {
      obj[key] = value === "true"
      return
    }
    obj[key] = value.trim() === "" ? null : value.trim()
  })
  return obj
}

export async function uploadFoodImage(file: File): Promise<{ url?: string; error?: string }> {
  const fileError = validateFile(file, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024)
  if (fileError) return { error: fileError }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!validateFileSignature(buffer, file.type)) {
    return { error: "File content doesn't match its declared type" }
  }

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "campushub-food", quality: "auto:best" },
          (err, res) => (err ? reject(err) : resolve(res))
        )
        .end(buffer)
    })
    return { url: result.secure_url }
  } catch (err) {
    console.error("[food] image upload failed:", err)
    return { error: "Image upload failed. Please try again." }
  }
}