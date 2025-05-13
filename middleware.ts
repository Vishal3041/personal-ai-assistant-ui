import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simple middleware that just passes through all requests
  // This avoids the MIDDLEWARE_INVOCATION_FAILED error
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
