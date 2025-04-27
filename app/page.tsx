"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LucideYoutube, LucideChrome, LucideLinkedin, LucideCalendar, Loader2 } from "lucide-react"
import { SetupGuide } from "@/components/setup-guide"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSetupComplete, setIsSetupComplete] = useState(true)
  const [missingKeys, setMissingKeys] = useState<string[]>([])

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch("/api/check-setup")
        const data = await response.json()
        setIsSetupComplete(data.isSetupComplete)
        setMissingKeys(data.missingKeys)
      } catch (error) {
        console.error("Error checking setup:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSetup()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <SetupGuide missingKeys={missingKeys} onSetupComplete={() => setIsSetupComplete(true)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
            Personal AI Assistant
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Your personalized AI assistant powered by fine-tuned models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AssistantCard
            title="YouTube Assistant"
            description="Chat with your YouTube history"
            icon={<LucideYoutube className="h-8 w-8 text-red-600" />}
            href="/assistants/youtube"
          />

          <AssistantCard
            title="Chrome Assistant"
            description="Chat with your Chrome browsing history"
            icon={<LucideChrome className="h-8 w-8 text-blue-500" />}
            href="/assistants/chrome"
          />

          <AssistantCard
            title="LinkedIn Assistant"
            description="Chat with your LinkedIn data"
            icon={<LucideLinkedin className="h-8 w-8 text-blue-700" />}
            href="/assistants/linkedin"
          />

          <AssistantCard
            title="Calendar Assistant"
            description="Manage your calendar with AI"
            icon={<LucideCalendar className="h-8 w-8 text-green-600" />}
            href="/assistants/calendar"
          />
        </div>
      </div>
    </div>
  )
}

function AssistantCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-center mb-4">{icon}</div>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="pt-0">
        <Link href={href} className="w-full">
          <Button className="w-full">Open Assistant</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
