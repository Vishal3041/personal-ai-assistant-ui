import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  console.log("Fallback route called:", url.toString())

  // Always redirect to simulation mode
  return NextResponse.redirect(`${url.origin}/assistants/calendar?auth=simulation`)
}

