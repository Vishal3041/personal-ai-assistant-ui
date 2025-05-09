import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simplified middleware that just passes through all requests
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
