import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

// Initialize Hugging Face client with the updated API key
const hf = new HfInference("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")

export async function GET() {
  const results = {
    youtube: { status: "unknown", error: null },
    chrome: { status: "unknown", error: null },
    openai: { status: "unknown", error: null },
  }

  // Check YouTube model
  try {
    const youtubeModelInfo = await fetch(
      "https://api-inference.huggingface.co/models/Vishal3041/falcon_finetuned_llm",
      {
        headers: { Authorization: `Bearer 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` },
        method: "GET",
      },
    )

    results.youtube.status = youtubeModelInfo.ok ? "available" : "unavailable"
    if (!youtubeModelInfo.ok) {
      const errorData = await youtubeModelInfo.json()
      results.youtube.error = errorData
    }
  } catch (error) {
    results.youtube.status = "error"
    results.youtube.error = error.message
  }

  // Check Chrome model
  try {
    const chromeModelInfo = await fetch(
      "https://api-inference.huggingface.co/models/Vishal3041/TransNormerLLM_finetuned",
      {
        headers: { Authorization: `Bearer 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` },
        method: "GET",
      },
    )

    results.chrome.status = chromeModelInfo.ok ? "available" : "unavailable"
    if (!chromeModelInfo.ok) {
      const errorData = await chromeModelInfo.json()
      results.chrome.error = errorData
    }
  } catch (error) {
    results.chrome.status = "error"
    results.chrome.error = error.message
  }

  // Check OpenAI
  try {
    const { generateText } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: "Hello",
      system: "You are a helpful assistant.",
    })

    results.openai.status = "available"
  } catch (error) {
    results.openai.status = "error"
    results.openai.error = error.message
  }

  return NextResponse.json(results)
}

