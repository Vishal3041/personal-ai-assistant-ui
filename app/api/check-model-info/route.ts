import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const modelPath = searchParams.get("model") || "Vishal3041/falcon_finetuned_llm"

  try {
    // Get model info
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelPath}`, {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
      method: "GET",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: "Failed to get model info", details: errorData }, { status: response.status })
    }

    const modelInfo = await response.json()

    // Try to get pipeline info
    let pipelineInfo = null
    try {
      const pipelineResponse = await fetch(`https://api-inference.huggingface.co/pipeline/list/${modelPath}`, {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        method: "GET",
      })

      if (pipelineResponse.ok) {
        pipelineInfo = await pipelineResponse.json()
      }
    } catch (error) {
      console.error("Error getting pipeline info:", error)
    }

    return NextResponse.json({
      modelInfo,
      pipelineInfo,
      modelPath,
    })
  } catch (error) {
    console.error("Error checking model info:", error)
    return NextResponse.json({ error: "Failed to check model info", details: error.message }, { status: 500 })
  }
}

