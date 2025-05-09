import { NextResponse } from "next/server"
import { getPineconeClient, INDEXES } from "@/lib/pinecone-client"
import { getEmbedding } from "@/lib/embedding"

// Chrome model path
const CHROME_MODEL_PATH = "Vishal3041/TransNormerLLM_finetuned"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    console.log("Chrome query received:", query)

    // Get Pinecone client
    let context = ""
    try {
      const pinecone = getPineconeClient()
      const index = pinecone.Index(INDEXES.Chrome)

      // Generate embedding for the query
      const queryEmbedding = await getEmbedding(query)
      console.log("Generated embedding for query")

      // Search Pinecone for relevant context
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      })
      console.log("Pinecone search results:", searchResults.matches.length)

      // Format context from search results
      context = searchResults.matches
        .map((match) => {
          const metadata = match.metadata
          return `Title: ${metadata.Title}\nTimestamp: ${metadata.Timestamp}\nDomain: ${metadata.Domain || "N/A"}`
        })
        .join("\n\n")

      console.log("Context prepared for model")
    } catch (pineconeError) {
      console.error("Error with Pinecone:", pineconeError)
      // Continue without context if Pinecone fails
      context = ""
    }

    // Prepare input for the model
    const inputText = `### Question: ${query}\n\n### Context:\n${context}\n\n### Answer:`

    // Try multiple approaches to call the model
    let modelResponse = null
    const errorMessages = []

    // Approach 1: Try text-generation task
    try {
      console.log("Trying text-generation task")
      const response = await fetch(`https://api-inference.huggingface.co/models/${CHROME_MODEL_PATH}`, {
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
        console.log("Model response received from text-generation")
      } else {
        const errorData = await response.json()
        errorMessages.push(`text-generation error: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      errorMessages.push(`text-generation error: ${error.message}`)
    }

    // Approach 2: Try text2text-generation task if first approach failed
    if (!modelResponse) {
      try {
        console.log("Trying text2text-generation task")
        const response = await fetch(`https://api-inference.huggingface.co/models/${CHROME_MODEL_PATH}`, {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
            "X-Use-Cache": "false",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: inputText,
            parameters: {
              max_length: 512,
              do_sample: true,
              temperature: 0.7,
              top_p: 0.9,
            },
          }),
        })

        if (response.ok) {
          modelResponse = await response.json()
          console.log("Model response received from text2text-generation")
        } else {
          const errorData = await response.json()
          errorMessages.push(`text2text-generation error: ${JSON.stringify(errorData)}`)
        }
      } catch (error) {
        errorMessages.push(`text2text-generation error: ${error.message}`)
      }
    }

    // Approach 3: Try without specifying a task (let Hugging Face infer it)
    if (!modelResponse) {
      try {
        console.log("Trying without specifying task")
        const response = await fetch(
          `https://api-inference.huggingface.co/pipeline/text-generation/${CHROME_MODEL_PATH}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: inputText,
            }),
          },
        )

        if (response.ok) {
          modelResponse = await response.json()
          console.log("Model response received without specifying task")
        } else {
          const errorData = await response.json()
          errorMessages.push(`no-task error: ${JSON.stringify(errorData)}`)
        }
      } catch (error) {
        errorMessages.push(`no-task error: ${error.message}`)
      }
    }

    // If all approaches failed, use a fallback response
    if (!modelResponse) {
      console.log("All model approaches failed, using fallback")

      // Check if we at least have context from Pinecone
      if (context) {
        // Create a fallback response based on the context
        return NextResponse.json({
          response: formatChromeResponse(query, context),
          errors: errorMessages.join("; "),
        })
      } else {
        // No context and no model response, return a generic message
        return NextResponse.json({
          response: `I'm having trouble accessing your Chrome browsing history data right now. Please try again later.`,
          errors: errorMessages.join("; "),
        })
      }
    }

    // Extract the generated text from the model response
    let generatedText = ""
    if (Array.isArray(modelResponse)) {
      generatedText = modelResponse[0]?.generated_text || ""
    } else {
      generatedText = modelResponse.generated_text || ""
    }

    return NextResponse.json({
      response: generatedText || formatChromeResponse(query, context),
      raw_response: modelResponse,
      context: context,
    })
  } catch (error) {
    console.error("Error processing Chrome query:", error)
    return NextResponse.json({ error: "Failed to process your request", details: error.message }, { status: 500 })
  }
}

// Helper function to format a fallback response
function formatChromeResponse(query: string, context: string): string {
  if (!context) {
    return `I couldn't find any information about "${query}" in your Chrome browsing history.`
  }

  // Parse the context to extract website information
  const websites = context.split("\n\n").map((siteText) => {
    const lines = siteText.split("\n")
    const title = lines[0].replace("Title: ", "")
    const timestamp = lines[1].replace("Timestamp: ", "")
    const domain = lines[2]?.replace("Domain: ", "") || "N/A"

    return { title, timestamp, domain }
  })

  // Format the response with better spacing and organization
  const formattedSites = websites
    .map((site) => {
      return `📌 **${site.title}**
*Watched on: ${site.timestamp}*${
        site.domain !== "N/A"
          ? `
🔗 ${site.domain}`
          : ""
      }`
    })
    .join("\n\n")

  return `I found the following information about "${query}" in your Chrome browsing history:

${formattedSites}

Based on your browsing history, you might be interested in websites related to this topic.`
}
