"use client"

import { useState, useEffect } from "react"
import { ChatInterface, type Message } from "@/components/chat-interface"
import { AssistantLayout } from "@/components/assistant-layout"
import { LucideCalendar, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"

export default function CalendarAssistantPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isSimulationMode, setIsSimulationMode] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Calendar Assistant. I can help you manage your schedule, create events, and check your availability. What would you like to do?",
    },
  ])

  // Check for authentication status from URL params
  useEffect(() => {
    const authStatus = searchParams.get("auth")
    const errorMessage = searchParams.get("message")

    console.log("Auth status from URL:", { authStatus, errorMessage })

    if (authStatus === "success") {
      setIsAuthenticated(true)
      setIsSimulationMode(false)
      setAuthError(null)
      toast({
        title: "Authentication Successful",
        description: "You've successfully connected your Google Calendar.",
        variant: "default",
      })
    } else if (authStatus === "simulation") {
      // Handle simulation mode redirect
      setIsAuthenticated(true)
      setIsSimulationMode(true)
      setAuthError(null)
      toast({
        title: "Simulation Mode Activated",
        description: "You're now using the Calendar Assistant in simulation mode.",
        variant: "default",
      })
    } else if (authStatus === "error") {
      setIsAuthenticating(false)
      setAuthError(errorMessage || "Unknown error")
      toast({
        title: "Authentication Failed",
        description: `Failed to connect your Google Calendar: ${errorMessage || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  // Load email from localStorage if available
  useEffect(() => {
    const savedEmail = localStorage.getItem("calendarEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      console.log("Sending message to Calendar assistant API")
      const response = await fetch("/api/assistants/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          email: email,
          simulationMode: isSimulationMode, // Use the actual state instead of hardcoding to true
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `API responded with status ${response.status}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

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

  const handleAuthenticate = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsAuthenticating(true)
    setAuthError(null)

    // Store email in localStorage for persistence
    localStorage.setItem("calendarEmail", email)

    // Try the API test endpoint first to verify API routes are working
    fetch("/api/test")
      .then((response) => {
        if (!response.ok) {
          throw new Error("API routes are not working properly")
        }
        return response.json()
      })
      .then((data) => {
        console.log("API test successful:", data)
        // If API test is successful, try the OAuth flow
        window.location.href = "/api/auth/google-calendar"
      })
      .catch((error) => {
        console.error("API test failed:", error)
        // If API test fails, use simulation mode
        setIsAuthenticated(true)
        setIsSimulationMode(true)
        setIsAuthenticating(false)
        toast({
          title: "Using Simulation Mode",
          description: "API routes are not working properly. Using simulation mode instead.",
          variant: "warning",
        })
      })
  }

  const handleSimulationLogin = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Store email in localStorage for persistence
    localStorage.setItem("calendarEmail", email)
    setIsAuthenticated(true)
    setIsSimulationMode(true)
    setAuthError(null)

    toast({
      title: "Simulation Mode Activated",
      description: "You're now using the Calendar Assistant in simulation mode.",
      variant: "default",
    })
  }

  if (!isAuthenticated) {
    return (
      <AssistantLayout>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Calendar Assistant</CardTitle>
            <CardDescription>Connect your Google Calendar or use simulation mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Recommendation</AlertTitle>
                <AlertDescription>
                  We recommend using Simulation Mode for testing. OAuth integration requires additional configuration.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={handleSimulationLogin} className="w-full">
              Use Simulation Mode
            </Button>
            <Button onClick={handleAuthenticate} disabled={isAuthenticating} variant="outline" className="w-full">
              Try Google Calendar OAuth
            </Button>
          </CardFooter>
        </Card>
      </AssistantLayout>
    )
  }

  return (
    <AssistantLayout>
      {isSimulationMode && (
        <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Simulation Mode</AlertTitle>
          <AlertDescription>
            You're using the Calendar Assistant in simulation mode. Calendar events are simulated and not actually
            created.
          </AlertDescription>
        </Alert>
      )}
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
