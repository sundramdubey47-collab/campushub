import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notifyCollege } from "@/lib/notify"
import { getFoodUser, isFoodAdmin, vendorSchema, formToObject, cleanPhone, uploadFoodImage } from "@/lib/food-server"
import { formatZodError } from "@/lib/validations"

export async function GET() {
  const user = await getFoodUser()
  if (!user?.collegeId) return NextResponse.json({ vendors: [], isAdmin: false })

  const admin = isFoodAdmin(user.role)

  const vendors = await prisma.foodVendor.findMany({
    where: admin ? { collegeId: user.collegeId } : { managerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { name: true, email: true } },
      _count: { select: { menuItems: true, enquiries: true } },
    },
  })

  return NextResponse.json({ vendors, isAdmin: admin })
}

export async function POST(req: Request) {
  try {
    const user = await getFoodUser()
    if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })
    if (!isFoodAdmin(user.role)) return NextResponse.json({ error: "Only admins can add vendors" }, { status: 403 })
    if (!user.collegeId) return NextResponse.json({ error: "Your college is not set" }, { status: 400 })

    const fd = await req.formData()
    const parsed = vendorSchema.safeParse(formToObject(fd))
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })

    const phone = cleanPhone(parsed.data.phone)
    if (!phone) return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 })

    let whatsapp: string | null = null
    if (parsed.data.whatsapp) {
      whatsapp = cleanPhone(parsed.data.whatsapp)
      if (!whatsapp) return NextResponse.json({ error: "Enter a valid 10-digit WhatsApp number" }, { status: 400 })
    }

    let imageUrl: string | null = null
    const file = fd.get("image")
    if (file instanceof File && file.size > 0) {
      const up = await uploadFoodImage(file)
      if (up.error) return NextResponse.json({ error: up.error }, { status: 400 })
      imageUrl = up.url ?? null
    }

    const vendor = await prisma.foodVendor.create({
      data: {
        ...parsed.data,
        phone,
        whatsapp,
        imageUrl,
        collegeId: user.collegeId,
      } as any,
    })

    if (fd.get("notifyStudents") === "true") {
      await notifyCollege({
        collegeId: user.collegeId,
        type: "FOOD",
        title: "🍽️ New in Food & Mess",
        body: `${vendor.name} is now on CampusHub`,
        link: `/food/${vendor.id}`,
        excludeUserId: user.id,
      })
    }

    return NextResponse.json(vendor)
  } catch (err) {
    console.error("[food] create vendor failed:", err)
    return NextResponse.json({ error: "Could not create vendor. Please try again." }, { status: 500 })
  }
}