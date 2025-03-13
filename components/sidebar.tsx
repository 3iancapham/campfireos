"use client"

import type React from "react"

import { Home, Target, Layers, Settings, TrendingUp, Menu, X, Share2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Define the navigation items - updated to replace Favorites with Trends and remove Marketplace
const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "Strategy",
    path: "/strategy",
    icon: Target,
  },
  {
    name: "Socials",
    icon: Share2,
    path: "/socials",
    description: "Connect and manage your social media accounts",
  },
  {
    name: "Trends",
    icon: TrendingUp,
    path: "/trends",
    description: "Stay updated with the latest social media trends",
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    isHeader: true,
  },
]

// Create a new component that accepts open state from parent
function SidebarWithState({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <>
      {/* Mobile menu button - always visible when sidebar is closed */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-50",
          open ? "md:hidden" : "", // Only hide on desktop when sidebar is open
        )}
        onClick={() => onOpenChange(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#121212] text-white transition-all duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "shadow-lg", // Add shadow for better visual separation
        )}
      >
        {/* Logo and title */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="/placeholder.svg?height=40&width=40"
              alt="CampfireOS Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-semibold">CampfireOS</span>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.path} className={item.isHeader ? "mt-6" : ""}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-md transition-colors",
                    pathname === item.path
                      ? "bg-primary/20 text-white" // This will now use the orange primary color
                      : "text-white/70 hover:bg-primary/10 hover:text-white",
                  )}
                  onClick={() => isMobile && onOpenChange(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

// Custom hook for media queries
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

// Update the Layout component to adjust the main content based on sidebar state

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check if we're on mobile and update sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setSidebarOpen(!mobile)
    }

    // Initial check
    checkMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SidebarWithState open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className={cn("min-h-screen transition-all duration-300", sidebarOpen ? "md:pl-64" : "pl-0")}>
        <main className="p-4 md:p-6">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" className="mb-4" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

