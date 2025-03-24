import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth"
import { ChatAssistant } from "@/components/chat-assistant"

export const metadata: Metadata = {
  title: "CampfireOS",
  description: "Your AI-powered social media strategy assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          <Toaster />
          <ChatAssistant />
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'