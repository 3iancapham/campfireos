"use client"

import { FixLocalStorageButton } from '@/components/fix-local-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/auth'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function FixDataPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to fix your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fix Your Data</CardTitle>
          <CardDescription>
            If you're having trouble accessing your strategy or content plan, this tool can help fix data synchronization issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            This will sync your data from our database to your browser's local storage. This is useful if you've created a strategy on one device and are trying to access it from another device.
          </p>
          
          <FixLocalStorageButton />
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>Still having issues? Try these steps:</p>
            <ol className="list-decimal pl-4 mt-2 space-y-1">
              <li>Clear your browser cache and cookies</li>
              <li>Log out and log back in</li>
              <li>Try a different browser</li>
              <li>Contact support if the issue persists</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 