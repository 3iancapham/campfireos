import type React from "react"
import { Layout } from "@/components/sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - CampfireOS",
  description: "Manage all your social media accounts with AI assistance",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout>{children}</Layout>
}

