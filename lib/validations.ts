import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(6).max(100),
  referralCode: z.string().max(20).optional().nullable(),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(100),
})

export const onboardingSchema = z.object({
  collegeId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  courseId: z.coerce.number().int().positive(),
  semesterId: z.coerce.number().int().positive(),
})

export const noteUploadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  courseId: z.coerce.number().int().positive(),
  semesterId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive().optional().nullable(),
  category: z.enum([
    "NOTES", "ASSIGNMENT", "LAB_RECORD", "PREVIOUS_YEAR_PAPER", "BOOK",
    "PRESENTATION", "PRACTICAL_FILE", "QUESTION_BANK", "FACULTY_NOTES",
    "VIVA_QUESTIONS", "PROJECT", "SYLLABUS", "OTHERS",
  ]).optional(),
  unit: z.string().trim().max(50).optional(),
  isPremium: z.enum(["true", "false"]).optional(),
})

export const feedbackSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  page: z.string().max(200).optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
})

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  otp: z.string().length(6),
  newPassword: z.string().min(6).max(100),
})

// Helper — Zod error ko clean, user-facing message me convert karta hai
export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0]
  return first ? `${first.path.join(".")}: ${first.message}` : "Invalid input"
}