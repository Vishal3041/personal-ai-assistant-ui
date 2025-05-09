import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface AssistantLayoutProps {
  children: React.ReactNode
}

export function AssistantLayout({ children }: AssistantLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}

