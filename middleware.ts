import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Add global error handling for API routes
  try {
    // Check for API keys in environment variables
    const missingKeys = []

    if (!process.env.PINECONE_API_KEY) {
      missingKeys.push("PINECONE_API_KEY")
    }

    if (!process.env.HF_API_KEY) {
      missingKeys.push("HF_API_KEY")
    }

    if (!process.env.OPENAI_API_KEY) {
      missingKeys.push("OPENAI_API_KEY")
    }

    if (!process.env.COMPOSIO_API_KEY) {
      missingKeys.push("COMPOSIO_API_KEY")
    }

    // If any keys are missing and this is an API route, return an error
    if (missingKeys.length > 0 && request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: `Missing required environment variables: ${missingKeys.join(", ")}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware caught an error:", error)

    // If this is an API route, return a JSON error
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
    }

    // Otherwise, continue
    return NextResponse.next()
  }
}

// Add a global handler for unhandled promise rejections
if (typeof window === "undefined") {
  // Server-side only
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
