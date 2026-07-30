import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Extra runtime security headers (Next.js config wale ke upar, defense-in-depth)
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Download-Options", "noopen")
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none")

  return response
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
}