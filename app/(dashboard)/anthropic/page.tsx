"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/providers/auth"
import { useUserData } from '@/lib/hooks/useUserData'

export default function AnthropicTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { userData, loading: dataLoading } = useUserData()
  const [rawResponse, setRawResponse] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const generateRawStrategy = async () => {
    try {
      setGenerating(true)
      setError(null)
      
      // Get survey data from local storage
      const surveyData = JSON.parse(localStorage.getItem("onboardingSurvey") || "{}")
      
      // Call the API to get the raw response
      const response = await fetch('/api/anthropic-raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setRawResponse(data.rawResponse || "No response received")
    } catch (err) {
      console.error("Error generating raw strategy:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setGenerating(false)
    }
  }

  // Initial loading state
  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        <p className="text-muted-foreground max-w-md mb-8 text-center">
          Loading your data...
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Anthropic Raw Response Test</h1>
          <p className="text-gray-600">
            View the raw response from Anthropic to help debug parsing issues
          </p>
        </div>
        <Button
          onClick={generateRawStrategy}
          disabled={generating}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Raw Response
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Raw Anthropic Response</CardTitle>
        </CardHeader>
        <CardContent>
          {generating ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : rawResponse ? (
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border overflow-auto max-h-[70vh]">
              {rawResponse}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Click the "Generate Raw Response" button to see the raw output from Anthropic
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/strategy')}
        >
          Back to Strategy Page
        </Button>
      </div>
    </div>
  )
} 