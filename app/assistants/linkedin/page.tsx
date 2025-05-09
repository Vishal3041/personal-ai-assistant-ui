"use client"

import { useState } from "react"
import { ChatInterface, type Message } from "@/components/chat-interface"
import { AssistantLayout } from "@/components/assistant-layout"
import { LucideLinkedin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LinkedInAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your LinkedIn Assistant. I can help you find information from your LinkedIn data. Note: This integration is currently in development.",
    },
  ])

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch("/api/assistants/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from LinkedIn assistant")
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Error querying LinkedIn assistant:", error)
      toast({
        title: "Error",
        description: "Failed to get a response from the LinkedIn assistant. Please try again.",
        variant: "destructive",
      })
      return "Sorry, I encountered an error while processing your request. Please try again."
    }
  }

  return (
    <AssistantLayout>
      <ChatInterface
        title="LinkedIn Assistant"
        icon={<LucideLinkedin className="h-5 w-5 text-blue-700" />}
        initialMessages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Ask about your LinkedIn data..."
      />
    </AssistantLayout>
  )
}

