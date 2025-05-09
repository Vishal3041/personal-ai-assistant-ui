"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Youtube, Chrome, Linkedin, Calendar } from "lucide-react"

export interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  title: string
  icon: React.ReactNode
  initialMessages?: Message[]
  onSendMessage: (message: string) => Promise<string>
  placeholder?: string
}

export function ChatInterface({
  title,
  icon,
  initialMessages = [],
  onSendMessage,
  placeholder = "Type your message here...",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      // Get response from the assistant
      const response = await onSendMessage(userMessage)

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get the appropriate icon based on the title
  const getAssistantIcon = () => {
    if (title.includes("YouTube")) return <Youtube className="h-full w-full text-red-600 p-1" />
    if (title.includes("Chrome")) return <Chrome className="h-full w-full text-blue-500 p-1" />
    if (title.includes("LinkedIn")) return <Linkedin className="h-full w-full text-blue-700 p-1" />
    if (title.includes("Calendar")) return <Calendar className="h-full w-full text-green-600 p-1" />
    return null
  }

  // Function to format message content with better styling
  const formatMessageContent = (content: string) => {
    // Replace video entries with better formatting
    const formattedContent = content
      // Format video titles with proper styling
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      // Format timestamps with proper styling
      .replace(/\*(Watched on:.*?)\*/g, '<span class="text-gray-400 text-sm">$1</span>')
      // Format URLs as links
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" class="text-blue-400 hover:underline break-all" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // Replace emoji placeholders with actual emojis
      .replace(/🎬/g, "🎬 ")
      .replace(/📅/g, "📅 ")
      .replace(/🔗/g, "🔗 ")
      .replace(/📌/g, "📌 ")
      .replace(/🕒/g, "🕒 ")
      // Add line breaks for better readability
      .split("\n\n")
      .join('</p><p class="mt-2">')

    return <div className="space-y-2" dangerouslySetInnerHTML={{ __html: `<p>${formattedContent}</p>` }} />
  }

  return (
    <Card className="flex flex-col h-full min-h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-background">
      <CardHeader className="border-b">
        <div className="flex items-center">
          <div className="mr-2">{icon}</div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)] p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Start a conversation with your assistant
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className={`${message.role === "user" ? "ml-2" : "mr-2"} h-10 w-10 flex-shrink-0`}>
                      <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                      {message.role === "assistant" && <AvatarImage src="/placeholder.svg?height=40&width=40" />}
                      {message.role === "assistant" && getAssistantIcon()}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted dark:bg-gray-800"
                      }`}
                    >
                      {message.role === "assistant" ? formatMessageContent(message.content) : message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] flex-row">
                    <Avatar className="mr-2 h-10 w-10 flex-shrink-0">
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      {getAssistantIcon()}
                    </Avatar>
                    <div className="rounded-lg px-4 py-3 bg-muted dark:bg-gray-800">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4 mt-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
