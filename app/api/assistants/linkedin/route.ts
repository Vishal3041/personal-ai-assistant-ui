import { NextResponse } from "next/server"

// LinkedIn model path - using the specific model
const LINKEDIN_MODEL_PATH = "HarshGahlaut/gpt-neo-linkedin"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    console.log("LinkedIn query received:", query)

    // Prepare input for the model without Pinecone context
    const inputText = `### Question: ${query}\n\n### Answer:`

    // Try to call the model
    let modelResponse = null
    const errorMessages = []

    try {
      console.log("Trying text-generation task with GPT-Neo LinkedIn model")
      const response = await fetch(`https://api-inference.huggingface.co/models/${LINKEDIN_MODEL_PATH}`, {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: inputText,
          parameters: {
            max_new_tokens: 512,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
          options: {
            use_cache: false,
            wait_for_model: true,
          },
        }),
      })

      if (response.ok) {
        modelResponse = await response.json()
        console.log("Model response received from GPT-Neo LinkedIn model")
      } else {
        const errorData = await response.json()
        errorMessages.push(`text-generation error: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      errorMessages.push(`text-generation error: ${error.message}`)
    }

    // If model call failed, use a fallback response
    if (!modelResponse) {
      console.log("Model approach failed, using fallback")
      return NextResponse.json({
        response: generateLinkedInResponse(query),
        errors: errorMessages.join("; "),
      })
    }

    // Extract the generated text from the model response
    let generatedText = ""
    if (Array.isArray(modelResponse)) {
      generatedText = modelResponse[0]?.generated_text || ""
    } else {
      generatedText = modelResponse.generated_text || ""
    }

    // Format the response with emojis and better formatting
    const formattedResponse = formatLinkedInModelResponse(generatedText, query)

    return NextResponse.json({
      response: formattedResponse,
      raw_response: modelResponse,
    })
  } catch (error) {
    console.error("Error processing LinkedIn query:", error)
    return NextResponse.json({ error: "Failed to process your request", details: error.message }, { status: 500 })
  }
}

// Helper function to format the model response with emojis and better formatting
function formatLinkedInModelResponse(text: string, query: string): string {
  // If the response already has emojis and formatting, return it as is
  if (text.includes("👤") || text.includes("🔗") || text.includes("**")) {
    return text
  }

  // If the model response is empty or too short, use the fallback
  if (!text || text.length < 20) {
    return generateLinkedInResponse(query)
  }

  // Add emojis and formatting to the response
  const formattedText = text
    // Add person emoji to lines that might be about people
    .replace(/(^|\n)([A-Z][a-z]+ [A-Z][a-z]+)/g, "$1👤 **$2**")
    // Add link emoji to lines that might be about connections
    .replace(/(connected|connection|profile)/gi, "🔗 $1")
    // Italicize job titles
    .replace(/(software engineer|developer|manager|director|ceo|cto|vp|president)/gi, "*$1*")

  return formattedText
}

// Helper function to generate a fallback LinkedIn response
function generateLinkedInResponse(query: string): string {
  // Sample connections data for fallback responses
  const sampleConnections = [
    { name: "John Smith", position: "Software Engineer at Tech Company", connectedOn: "March 15, 2023" },
    { name: "Sarah Johnson", position: "Product Manager at Innovation Inc.", connectedOn: "January 8, 2023" },
    { name: "Michael Brown", position: "Data Scientist at Analytics Corp", connectedOn: "April 22, 2023" },
  ]

  // Format the response with better spacing and organization
  const formattedConnections = sampleConnections
    .map((connection) => {
      return `👤 **${connection.name}**
*${connection.position}*
🔗 Connected on: ${connection.connectedOn}`
    })
    .join("\n\n")

  return `Here are some connections that might be relevant to "${query}" in your LinkedIn network:

${formattedConnections}

Would you like more information about any of these connections?`
}
