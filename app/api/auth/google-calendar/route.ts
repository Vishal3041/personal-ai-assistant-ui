import { NextResponse } from "next/server"

// This is a simplified version that focuses on just working correctly
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")

    // If we have a code, we're returning from Google OAuth
    if (code) {
      console.log("Received code from Google OAuth:", code.substring(0, 5) + "...")
      return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=success`)
    }

    // No code, so we're starting the OAuth flow
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=error&message=Missing_client_id`)
    }

    // Build the Google OAuth URL
    const redirectUri = `${url.origin}/api/auth/google-calendar`
    const scope = "https://www.googleapis.com/auth/calendar"

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("scope", scope)
    authUrl.searchParams.append("access_type", "offline")
    authUrl.searchParams.append("prompt", "consent")

    console.log("Redirecting to Google OAuth:", authUrl.toString())
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error("OAuth error:", error)
    if (error instanceof Error) {
      return NextResponse.redirect(
        `${url.origin}/assistants/calendar?auth=error&message=${encodeURIComponent(error.message)}`,
      )
    } else {
      return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=error&message=Unknown_Error`)
    }
  }
}

