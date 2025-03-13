"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusCircle,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"

const socialPlatforms = [
  { name: "Twitter", icon: Twitter, color: "text-blue-400" },
  { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { name: "YouTube", icon: Youtube, color: "text-red-600" },
]

export default function SocialsPage() {
  const [systems, setSystems] = useState<Array<{ id: string; name: string; platform: string }>>([])
  const [open, setOpen] = useState(false)
  const [newSystem, setNewSystem] = useState({ name: "", platform: "Twitter" })

  const handleCreateSystem = () => {
    setSystems([
      ...systems,
      {
        id: Math.random().toString(36).substring(7),
        name: newSystem.name,
        platform: newSystem.platform,
      },
    ])
    setNewSystem({ name: "", platform: "Twitter" })
    setOpen(false)
  }

  const getPlatformIcon = (platform: string) => {
    const found = socialPlatforms.find((p) => p.name === platform)
    if (!found) return Twitter
    return found.icon
  }

  const getPlatformColor = (platform: string) => {
    const found = socialPlatforms.find((p) => p.name === platform)
    if (!found) return "text-blue-400"
    return found.color
  }

  return (
    <div className="max-w-full">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Socials</h1>
        <p className="text-muted-foreground">Create and manage AI bots for each of your social media channels</p>
      </header>

      <Tabs defaultValue="systems" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-6">
            <TabsTrigger value="systems">Social Accounts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="systems">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Dialog open={open} onOpenChange={setOpen}>
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-[250px]">
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="h-20 w-20 rounded-full">
                      <PlusCircle className="h-10 w-10 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <p className="text-muted-foreground mt-4">Connect a social account</p>
                </CardContent>
              </Card>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Connect a social account</DialogTitle>
                  <DialogDescription>Configure an AI bot for one of your social media channels</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Twitter Content Bot"
                      value={newSystem.name}
                      onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Platform</Label>
                    <div className="flex flex-wrap gap-2">
                      {socialPlatforms.map((platform) => (
                        <Button
                          key={platform.name}
                          type="button"
                          variant={newSystem.platform === platform.name ? "default" : "outline"}
                          className="flex items-center gap-2"
                          onClick={() => setNewSystem({ ...newSystem, platform: platform.name })}
                        >
                          <platform.icon className={`h-4 w-4 ${platform.color}`} />
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleCreateSystem}>Connect Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {systems.map((system) => {
              const Icon = getPlatformIcon(system.platform)
              const color = getPlatformColor(system.platform)

              return (
                <Card key={system.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${color}`} />
                      <CardTitle>{system.platform} Bot</CardTitle>
                    </div>
                    <CardDescription>{system.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      This AI bot will help you create and schedule content for {system.platform}.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Configure
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarTab />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CalendarTab() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const currentDate = new Date()
  const currentDay = currentDate.getDate()
  const currentMonth = currentDate.toLocaleString("default", { month: "long" })

  // Generate calendar days for the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Sample scheduled posts
  const scheduledPosts = [
    { day: 3, platform: "Twitter", time: "10:00 AM" },
    { day: 7, platform: "Instagram", time: "2:00 PM" },
    { day: 12, platform: "LinkedIn", time: "9:00 AM" },
    { day: 18, platform: "Facebook", time: "4:30 PM" },
    { day: 22, platform: "Twitter", time: "11:15 AM" },
    { day: currentDay, platform: "Instagram", time: "3:00 PM" },
  ]

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return Twitter
      case "Instagram":
        return Instagram
      case "Facebook":
        return Facebook
      case "LinkedIn":
        return Linkedin
      case "YouTube":
        return Youtube
      default:
        return Twitter
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return "text-blue-400"
      case "Instagram":
        return "text-pink-500"
      case "Facebook":
        return "text-blue-600"
      case "LinkedIn":
        return "text-blue-700"
      case "YouTube":
        return "text-red-600"
      default:
        return "text-blue-400"
    }
  }

  return (
    <div className="space-y-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-[640px]">
        <h2 className="text-2xl font-bold">{currentMonth}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
          <Button size="sm">+ New Post</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 min-w-[640px]">
        {days.map((day) => (
          <div key={day} className="text-center font-medium text-xs sm:text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, index) => (
          <div key={`empty-${index}`} className="h-20 sm:h-32 border rounded-lg bg-muted/20"></div>
        ))}

        {calendarDays.map((day) => {
          const isToday = day === currentDay
          const postsForDay = scheduledPosts.filter((post) => post.day === day)

          return (
            <div
              key={day}
              className={`h-20 sm:h-32 border rounded-lg p-1 sm:p-2 ${isToday ? "border-primary border-2" : ""}`}
            >
              <div className={`text-xs sm:text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</div>
              <div className="mt-1 sm:mt-2 space-y-1">
                {postsForDay.map((post, index) => {
                  const Icon = getPlatformIcon(post.platform)
                  const color = getPlatformColor(post.platform)

                  return (
                    <div
                      key={index}
                      className="text-[10px] sm:text-xs bg-background p-1 rounded flex items-center gap-1 truncate"
                    >
                      <Icon className={`h-2 w-2 sm:h-3 sm:w-3 ${color} flex-shrink-0`} />
                      <span className="truncate">{post.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HistoryTab() {
  // Sample post history data
  const postHistory = [
    {
      id: "post1",
      title: "10 Tips for Better Social Media Engagement",
      platform: "Twitter",
      date: "2023-03-10",
      time: "10:30 AM",
      status: "published",
      engagement: {
        likes: 45,
        comments: 12,
        shares: 8,
      },
    },
    {
      id: "post2",
      title: "How AI is Transforming Content Creation",
      platform: "LinkedIn",
      date: "2023-03-08",
      time: "2:15 PM",
      status: "published",
      engagement: {
        likes: 78,
        comments: 23,
        shares: 15,
      },
    },
    {
      id: "post3",
      title: "Behind the Scenes: Our Creative Process",
      platform: "Instagram",
      date: "2023-03-15",
      time: "9:00 AM",
      status: "scheduled",
      engagement: null,
    },
    {
      id: "post4",
      title: "Upcoming Product Launch Teaser",
      platform: "Facebook",
      date: "2023-03-18",
      time: "3:45 PM",
      status: "scheduled",
      engagement: null,
    },
    {
      id: "post5",
      title: "Industry Insights: Future Trends",
      platform: "Twitter",
      date: "2023-03-05",
      time: "11:20 AM",
      status: "published",
      engagement: {
        likes: 32,
        comments: 7,
        shares: 14,
      },
    },
    {
      id: "post6",
      title: "Customer Success Story: XYZ Company",
      platform: "LinkedIn",
      date: "2023-03-20",
      time: "1:00 PM",
      status: "scheduled",
      engagement: null,
    },
  ]

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return Twitter
      case "Instagram":
        return Instagram
      case "Facebook":
        return Facebook
      case "LinkedIn":
        return Linkedin
      case "YouTube":
        return Youtube
      default:
        return Twitter
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return "text-blue-400"
      case "Instagram":
        return "text-pink-500"
      case "Facebook":
        return "text-blue-600"
      case "LinkedIn":
        return "text-blue-700"
      case "YouTube":
        return "text-red-600"
      default:
        return "text-blue-400"
    }
  }

  const getStatusIcon = (status: string) => {
    return status === "published" ? CheckCircle2 : Clock
  }

  const getStatusColor = (status: string) => {
    return status === "published" ? "text-green-500" : "text-amber-500"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Post History</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Published
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-amber-500" />
            Scheduled
          </Button>
          <Button size="sm">+ New Post</Button>
        </div>
      </div>

      <div className="space-y-4">
        {postHistory.map((post) => {
          const PlatformIcon = getPlatformIcon(post.platform)
          const platformColor = getPlatformColor(post.platform)
          const StatusIcon = getStatusIcon(post.status)
          const statusColor = getStatusColor(post.status)

          return (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${post.status === "published" ? "bg-green-100" : "bg-amber-100"} flex-shrink-0`}
                    >
                      <PlatformIcon className={`h-5 w-5 ${platformColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{post.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${post.status === "published" ? "bg-green-100" : "bg-amber-100"}`}
                        >
                          <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                          <span className="capitalize">{post.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.date)}
                        </span>
                        <span>•</span>
                        <span>{post.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <PlatformIcon className={`h-3 w-3 ${platformColor}`} />
                          {post.platform}
                        </span>
                      </div>
                    </div>
                  </div>

                  {post.status === "published" && post.engagement && (
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{post.engagement.likes}</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{post.engagement.comments}</div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{post.engagement.shares}</div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>
                    </div>
                  )}

                  {post.status === "scheduled" && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

