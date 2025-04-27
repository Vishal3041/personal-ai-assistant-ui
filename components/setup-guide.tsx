"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface SetupGuideProps {
  missingKeys: string[]
  onSetupComplete: () => void
}

export function SetupGuide({ missingKeys, onSetupComplete }: SetupGuideProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Setup Your Personal AI Assistant</CardTitle>
        <CardDescription>Complete the following steps to get your AI assistant up and running</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {missingKeys.length > 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing API Keys</AlertTitle>
            <AlertDescription>
              The following API keys are missing from your environment:
              <ul className="list-disc pl-5 mt-2">
                {missingKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>All Set!</AlertTitle>
            <AlertDescription>
              All required API keys are configured. Your AI assistant is ready to use.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Required API Keys:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>PINECONE_API_KEY - For vector database storage</li>
            <li>HF_API_KEY - For Hugging Face model access</li>
            <li>OPENAI_API_KEY - For calendar assistant</li>
            <li>COMPOSIO_API_KEY - For Google Calendar integration</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSetupComplete} disabled={missingKeys.length > 0} className="w-full">
          {missingKeys.length > 0 ? "Add Missing API Keys" : "Continue to Dashboard"}
        </Button>
      </CardFooter>
    </Card>
  )
}
