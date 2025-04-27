import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format date strings
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return url
  }
}

// Helper function to detect date in query
export function detectDateInQuery(query: string): string | null {
  const dateMatch = query.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  return dateMatch ? dateMatch[1] : null
}

// Helper function to detect domain in query
export function detectDomainInQuery(query: string): string | null {
  const domainMatch = query.match(/\b(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i)
  return domainMatch ? domainMatch[1] : null
}
