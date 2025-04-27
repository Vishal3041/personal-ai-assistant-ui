import { NextResponse } from "next/server"

export async function GET() {
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

  // Check for Google OAuth credentials
  if (!process.env.GOOGLE_CLIENT_ID) {
    missingKeys.push("GOOGLE_CLIENT_ID")
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    missingKeys.push("GOOGLE_CLIENT_SECRET")
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    missingKeys.push("NEXT_PUBLIC_APP_URL")
  }

  return NextResponse.json({
    isSetupComplete: missingKeys.length === 0,
    missingKeys,
  })
}
