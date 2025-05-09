import { HfInference } from "@huggingface/inference"

// Initialize the Hugging Face client
const hf = new HfInference(process.env.HF_API_KEY)

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Use the feature-extraction task to get embeddings
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    })

    // Return the embedding
    return Array.isArray(response) ? response : [response]
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

