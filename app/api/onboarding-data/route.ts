import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const universities = await prisma.university.findMany({
    include: {
      colleges: {
        include: {
          departments: {
            include: {
              courses: {
                include: {
                  semesters: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(universities)
}