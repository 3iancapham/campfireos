import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - CampfireOS",
  description: "Login or sign up to CampfireOS - AI Social Media Management",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-[#121212]" />
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-white">
            <img
              src="/campfireos-logo.png"
              alt="CampfireOS Logo"
              className="w-full h-full object-cover"
            />
          </div>
          CampfireOS
        </div>
        <div className="relative z-20 mt-20">
          <blockquote className="space-y-2">
            <p className="text-lg italic">
              "CampfireOS has completely transformed how we manage our social media presence. The AI-powered tools save
              us hours every week!"
            </p>
            <footer className="text-sm">Sofia Davis, Marketing Director</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] lg:w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}

