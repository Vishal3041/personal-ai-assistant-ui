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
  YouTube: "youtube-data-index",
  // LinkedIn index removed as it's not needed
}
