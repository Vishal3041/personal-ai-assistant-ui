import { NextResponse } from "next/server"

export async function GET() {
  const missingKeys = []

  if (!process.env.PINECONE_API_KEY) {
    missingKeys.push("PINECONE_API_KEY")
  }

  if (!process.env.HF_API_KEY) {
    missingKeys.push("HF_API_KEY")
  }

  return NextResponse.json({
    isSetupComplete: missingKeys.length === 0,
    missingKeys,
  })
}
