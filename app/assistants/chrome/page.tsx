"use client"

import { useState } from "react"
import { ChatInterface, type Message } from "@/components/chat-interface"
import { AssistantLayout } from "@/components/assistant-layout"
import { LucideChrome } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ChromeAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Chrome Assistant. I can help you find information from your browsing history. What would you like to know?",
    },
  ])

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      console.log("Sending message to Chrome assistant API")
      const response = await fetch("/api/assistants/chrome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      })

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `API responded with status ${response.status}`)
      }

      // If there are errors but we still got a response, show a warning
      // if (data.errors) {
        // toast({
          // title: "Warning",
          // description: "There were some issues with the model, but I've provided the best response I could.",
          // variant: "warning",
        // })
      // }

      return data.response || "Sorry, I couldn't process your request."
    } catch (error) {
      console.error("Error querying Chrome assistant:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to get a response from the Chrome assistant. Please try again.",
        variant: "destructive",
      })
      return "Sorry, I encountered an error while processing your request. Please try again."
    }
  }

  return (
    <AssistantLayout>
      <div className="min-h-[calc(100vh-6rem)]">
        <ChatInterface
          title="Chrome Assistant"
          icon={<LucideChrome className="h-5 w-5 text-blue-500" />}
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          placeholder="Ask about your browsing history..."
        />
      </div>
    </AssistantLayout>
  )
}
