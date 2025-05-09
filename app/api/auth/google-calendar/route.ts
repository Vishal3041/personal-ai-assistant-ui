import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    console.log("OAuth Request Details:", {
      url: request.url,
      code: code ? "Present" : "Missing",
      error,
      origin: url.origin,
      pathname: url.pathname,
    })

    // Handle error from Google
    if (error) {
      console.error("Google OAuth error:", error)
      return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=error&message=${encodeURIComponent(error)}`)
    }

    // If we have a code, exchange it for tokens
    if (code) {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET

        if (!clientId || !clientSecret) {
          throw new Error("OAuth credentials are not properly configured")
        }

        // Use the exact redirect URI that's configured in Google Cloud Console
        const redirectUri = `${url.origin}/api/auth/google-calendar`

        console.log("Exchanging code for tokens with:", {
          clientId: clientId.substring(0, 5) + "...",
          redirectUri,
          codeLength: code.length,
        })

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }).toString(),
        })

        const tokenData = await tokenResponse.json().catch(() => ({ error: "Failed to parse response" }))

        console.log("Token exchange response status:", tokenResponse.status)

        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenData.error || tokenResponse.status}`)
        }

        // Successfully exchanged code for tokens
        console.log("Successfully obtained tokens")

        // In a real implementation, you would store these tokens securely
        // For now, we'll just redirect to success
        return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=success`)
      } catch (tokenError) {
        console.error("Error exchanging code for tokens:", tokenError)
        return NextResponse.redirect(
          `${url.origin}/assistants/calendar?auth=error&message=${encodeURIComponent(tokenError.message)}`,
        )
      }
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
    const url = new URL(request.url)
    if (error instanceof Error) {
      return NextResponse.redirect(
        `${url.origin}/assistants/calendar?auth=error&message=${encodeURIComponent(error.message)}`,
      )
    } else {
      return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=error&message=Unknown_Error`)
    }
  }
}
