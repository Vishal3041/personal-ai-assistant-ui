"use client"

import { useState } from "react"
import { ChatInterface, type Message } from "@/components/chat-interface"
import { AssistantLayout } from "@/components/assistant-layout"
import { LucideCalendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CalendarAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Calendar Assistant. I can help you manage your schedule, create events, and check your availability. What would you like to do?",
    },
  ])

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      console.log("Sending message to Calendar assistant API")
      const response = await fetch("/api/assistants/calendar", {
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

      return data.response || "Sorry, I couldn't process your request."
    } catch (error) {
      console.error("Error querying Calendar assistant:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to get a response from the Calendar assistant. Please try again.",
        variant: "destructive",
      })
      return "Sorry, I encountered an error while processing your request. Please try again."
    }
  }

  return (
    <AssistantLayout>
      <div className="min-h-[calc(100vh-6rem)]">
        <ChatInterface
          title="Calendar Assistant"
          icon={<LucideCalendar className="h-5 w-5 text-green-600" />}
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          placeholder="Ask to create events, check availability..."
        />
      </div>
    </AssistantLayout>
  )
}
