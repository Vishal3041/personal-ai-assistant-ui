import { Pinecone } from "@pinecone-database/pinecone"

let pineconeInstance: Pinecone | null = null

export const getPineconeClient = () => {
  if (!pineconeInstance) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY environment variable is not set")
    }

    pineconeInstance = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })

    console.log("Pinecone client initialized")
  }
  return pineconeInstance
}

export const INDEXES = {
  Chrome: "chrome-history-index",
  YouTube: "youtube-final-index",
  LinkedIn: "linkedin-data-index", // This would be created when LinkedIn integration is ready
}
