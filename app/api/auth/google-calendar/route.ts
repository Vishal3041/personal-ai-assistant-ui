import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    // Always redirect to simulation mode for now
    return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=simulation`)
  } catch (error) {
    console.error("OAuth error:", error)
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=simulation`)
  }
}
