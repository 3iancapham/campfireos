"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart2,
  Target,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Download,
  Share2,
  Clipboard,
  BarChart,
  PieChart,
  LineChart,
  Clock,
  Image,
  Video,
  FileText,
  Megaphone,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/providers/auth"
import { useUserData } from '@/lib/hooks/useUserData'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { generateStrategy } from '@/lib/anthropic'

type UserStrategy = {
  mainTopic: string
  subTopic: string
  currentChannels: string[]
  targetAudience: {
    ageGroups: string[]
    gender: string
    interests: string[]
    location: string
    customInterests: string[]
  }
  goal: string
  goalDetails: string
  challenges: string[]
  generatedAt: string
}

type ContentPlan = {
  weeks: ContentWeek[]
  themes: ContentTheme[]
  generatedAt: string
}

type ContentWeek = {
  weekNumber: number
  posts: ContentPost[]
}

type ContentPost = {
  id: string
  platform: string
  contentType: "image" | "video" | "text" | "carousel" | "story"
  topic: string
  description: string
  suggestedDate: string
  suggestedTime: string
  status: "draft" | "scheduled" | "published"
}

type ContentTheme = {
  id: string
  name: string
  description: string
  color: string
}

export default function StrategyPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { userData, loading: dataLoading, error, updateStrategy } = useUserData()
  const [strategy, setStrategy] = useState<UserStrategy | null>(null)
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const checkAndGenerateStrategy = async () => {
      try {
        // Check for onboarding survey
        const onboardingSurvey = localStorage.getItem("onboardingSurvey")
        if (!onboardingSurvey) {
          router.push("/onboarding")
          return
        }

        // If we don't have a strategy yet, generate one
        if (!userData?.strategy) {
          setGeneratingPlan(true)
          const surveyData = JSON.parse(onboardingSurvey)
          const generatedStrategy = await generateStrategy(surveyData)
          
          // Store the strategy
          await updateStrategy(generatedStrategy)
          setStrategy(generatedStrategy)
        } else {
          setStrategy(userData.strategy)
        }

        // Load content plan if it exists
        const savedContentPlan = localStorage.getItem("contentPlan")
        if (savedContentPlan) {
          setContentPlan(JSON.parse(savedContentPlan))
        }
      } catch (error) {
        console.error("Error generating/loading strategy:", error)
      } finally {
        setGeneratingPlan(false)
      }
    }

    if (!dataLoading && userData) {
      checkAndGenerateStrategy()
    }
  }, [dataLoading, userData, router, updateStrategy])

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
          Loading your strategy...
        </p>
      </div>
    )
  }

  const startOnboarding = () => {
    router.push("/onboarding")
  }

  const handleCreateContentPlan = () => {
    if (!strategy) return

    setGeneratingPlan(true)

    // Simulate API call to generate content plan
    setTimeout(() => {
      const newContentPlan = generateContentPlan(strategy)
      setContentPlan(newContentPlan)
      localStorage.setItem("contentPlan", JSON.stringify(newContentPlan))
      setGeneratingPlan(false)
      setActiveTab("plan") // Switch to the plan tab
    }, 2000)
  }

  // Function to generate a content plan based on the strategy
  const generateContentPlan = (strategy: UserStrategy): ContentPlan => {
    // Generate content themes based on strategy
    const themes = generateContentThemes(strategy)

    // Generate 4 weeks of content
    const weeks = Array.from({ length: 4 }, (_, i) => {
      return {
        weekNumber: i + 1,
        posts: generatePostsForWeek(i + 1, strategy, themes),
      }
    })

    return {
      weeks,
      themes,
      generatedAt: new Date().toISOString(),
    }
  }

  // Generate content themes based on strategy
  const generateContentThemes = (strategy: UserStrategy): ContentTheme[] => {
    const baseThemes = [
      {
        id: "educational",
        name: "Educational Content",
        description: `Tips, tutorials, and insights about ${strategy.mainTopic}`,
        color: "bg-blue-100 text-blue-800",
      },
      {
        id: "engagement",
        name: "Engagement Content",
        description: "Questions, polls, and interactive content to engage your audience",
        color: "bg-purple-100 text-purple-800",
      },
      {
        id: "promotional",
        name: "Promotional Content",
        description:
          strategy.goal === "product" || strategy.goal === "service"
            ? `Showcase your ${strategy.goal}s and offerings`
            : "Promote your brand and values",
        color: "bg-amber-100 text-amber-800",
      },
      {
        id: "trending",
        name: "Trending Topics",
        description: `Current trends and news related to ${strategy.mainTopic}`,
        color: "bg-orange-100 text-orange-800",
      },
    ]

    // Add a theme based on the goal
    if (strategy.goal === "community") {
      baseThemes.push({
        id: "community",
        name: "Community Spotlight",
        description: "Highlight community members and foster connections",
        color: "bg-pink-100 text-pink-800",
      })
    } else if (strategy.goal === "awareness") {
      baseThemes.push({
        id: "thoughtleadership",
        name: "Thought Leadership",
        description: "Establish authority and share industry insights",
        color: "bg-indigo-100 text-indigo-800",
      })
    }

    return baseThemes
  }

  // Generate posts for a specific week
  const generatePostsForWeek = (weekNumber: number, strategy: UserStrategy, themes: ContentTheme[]): ContentPost[] => {
    const platforms =
      strategy.currentChannels.length > 0 ? strategy.currentChannels : ["instagram", "tiktok", "twitter"] // Default platforms if none selected

    const posts: ContentPost[] = []

    // Generate 3-5 posts per platform for the week
    platforms.forEach((platform) => {
      const postsPerPlatform = Math.floor(Math.random() * 3) + 3 // 3-5 posts

      for (let i = 0; i < postsPerPlatform; i++) {
        const theme = themes[Math.floor(Math.random() * themes.length)]
        const contentTypes: ("image" | "video" | "text" | "carousel" | "story")[] =
          platform === "instagram"
            ? ["image", "carousel", "story"]
            : platform === "tiktok"
              ? ["video"]
              : platform === "twitter"
                ? ["text", "image"]
                : platform === "facebook"
                  ? ["text", "image", "video"]
                  : platform === "linkedin"
                    ? ["text", "image", "carousel"]
                    : platform === "youtube"
                      ? ["video"]
                      : ["image", "text"]

        const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)]

        // Generate a date within the week
        const date = new Date()
        date.setDate(date.getDate() + (weekNumber - 1) * 7 + Math.floor(Math.random() * 7))

        // Generate a time between 9am and 7pm
        const hour = 9 + Math.floor(Math.random() * 10)
        const minute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, or 45
        date.setHours(hour, minute)

        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })

        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })

        // Generate post topics based on the theme and strategy
        const topics = {
          educational: [
            `How to get started with ${strategy.subTopic}`,
            `${strategy.mainTopic} tips for beginners`,
            `The ultimate guide to ${strategy.subTopic}`,
            `Common mistakes in ${strategy.mainTopic} and how to avoid them`,
            `${strategy.subTopic} explained in simple terms`,
          ],
          engagement: [
            `What's your biggest challenge with ${strategy.mainTopic}?`,
            `Poll: Which aspect of ${strategy.subTopic} interests you most?`,
            `Share your ${strategy.mainTopic} journey in the comments`,
            `Tag someone who needs to see this ${strategy.subTopic} tip`,
            `What would you like to learn about ${strategy.mainTopic}?`,
          ],
          promotional: [
            `Introducing our new ${strategy.subTopic} offering`,
            `Limited time offer for ${strategy.mainTopic} enthusiasts`,
            `How our ${strategy.subTopic} solution can help you`,
            `Client success story: ${strategy.mainTopic} transformation`,
            `Behind the scenes of our ${strategy.subTopic} process`,
          ],
          trending: [
            `Breaking: Latest trends in ${strategy.mainTopic}`,
            `How recent changes affect ${strategy.subTopic}`,
            `Responding to the latest ${strategy.mainTopic} news`,
            `Our take on the viral ${strategy.subTopic} challenge`,
            `Industry updates: What's new in ${strategy.mainTopic}`,
          ],
          community: [
            `Community spotlight: Amazing ${strategy.mainTopic} creators`,
            `${strategy.subTopic} community challenge`,
            `Meet our ${strategy.mainTopic} community members`,
            `Community Q&A: ${strategy.subTopic} edition`,
            `${strategy.mainTopic} community event announcement`,
          ],
          thoughtleadership: [
            `The future of ${strategy.mainTopic}: Our predictions`,
            `Why ${strategy.subTopic} matters more than ever`,
            `Our unique approach to ${strategy.mainTopic}`,
            `${strategy.subTopic} industry analysis`,
            `Challenging conventional wisdom about ${strategy.mainTopic}`,
          ],
        }

        const topicList = topics[theme.id as keyof typeof topics] || topics.educational
        const topic = topicList[Math.floor(Math.random() * topicList.length)]

        // Generate descriptions based on content type and topic
        let description = ""
        if (contentType === "image") {
          description = `Create a visually appealing ${platform} post about "${topic}". Include relevant hashtags and a call to action.`
        } else if (contentType === "video") {
          description = `Create a short ${platform === "tiktok" ? "60-second" : "2-3 minute"} video explaining "${topic}". Keep it engaging and informative.`
        } else if (contentType === "text") {
          description = `Write a compelling ${platform} post about "${topic}". Keep it concise and include a question to encourage engagement.`
        } else if (contentType === "carousel") {
          description = `Create a carousel post with 5-7 slides about "${topic}". Each slide should cover a key point or tip.`
        } else if (contentType === "story") {
          description = `Create a series of story frames about "${topic}". Include polls or questions to boost engagement.`
        }

        posts.push({
          id: `post-${weekNumber}-${platform}-${i}`,
          platform,
          contentType,
          topic,
          description,
          suggestedDate: formattedDate,
          suggestedTime: formattedTime,
          status: "draft",
        })
      }
    })

    // Sort posts by date and time
    return posts.sort((a, b) => {
      const dateA = new Date(`${a.suggestedDate} ${a.suggestedTime}`)
      const dateB = new Date(`${b.suggestedDate} ${b.suggestedTime}`)
      return dateA.getTime() - dateB.getTime()
    })
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Error loading strategy: {error}</p>
      </div>
    )
  }

  if (!userData?.strategy) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">No Strategy Found</h2>
          <p className="mb-4 text-gray-600">
            Please complete the onboarding process to generate your strategy.
          </p>
          <Button
            onClick={() => router.push('/onboarding')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Go to Onboarding
          </Button>
        </div>
      </div>
    )
  }

  const { strategy: userStrategy } = userData

  // Format the date
  const formattedDate = new Date(userStrategy.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get platform names from IDs
  const getPlatformNames = (platformIds: string[]) => {
    const platformMap: Record<string, string> = {
      instagram: "Instagram",
      tiktok: "TikTok",
      youtube: "YouTube",
      twitter: "Twitter",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      pinterest: "Pinterest",
      reddit: "Reddit",
      twitch: "Twitch",
    }

    return platformIds.map((id) => platformMap[id] || id)
  }

  // Get interest names from IDs
  const getInterestNames = (interestIds: string[]) => {
    const interestMap: Record<string, string> = {
      technology: "Technology",
      fashion: "Fashion",
      beauty: "Beauty",
      fitness: "Fitness",
      health: "Health & Wellness",
      food: "Food & Cooking",
      travel: "Travel",
      business: "Business",
      finance: "Finance",
      education: "Education",
      entertainment: "Entertainment",
      gaming: "Gaming",
      art: "Art & Design",
      music: "Music",
      diy: "DIY & Crafts",
    }

    return interestIds.map((id) => interestMap[id] || id)
  }

  // Generate platform recommendations based on niche and audience
  const getPlatformRecommendations = () => {
    const topic = userStrategy.mainTopic.toLowerCase()
    const subTopic = userStrategy.subTopic.toLowerCase()
    const audience = userStrategy.targetAudience

    // Base recommendations on topic
    const recommendations: Record<string, string[]> = {
      primary: [],
      secondary: [],
      experimental: [],
    }

    // Fashion, beauty, lifestyle
    if (topic.includes("fashion") || topic.includes("beauty") || subTopic.includes("lifestyle")) {
      recommendations.primary.push("Instagram", "TikTok", "Pinterest")
      recommendations.secondary.push("YouTube")
      recommendations.experimental.push("Snapchat")
    }
    // Tech, gaming, software
    else if (topic.includes("tech") || topic.includes("gaming") || topic.includes("software")) {
      recommendations.primary.push("YouTube", "Twitter", "Twitch")
      recommendations.secondary.push("Reddit", "Discord")
      recommendations.experimental.push("TikTok")
    }
    // Business, marketing, finance
    else if (topic.includes("business") || topic.includes("marketing") || topic.includes("finance")) {
      recommendations.primary.push("LinkedIn", "Twitter")
      recommendations.secondary.push("Facebook", "YouTube")
      recommendations.experimental.push("Instagram")
    }
    // Fitness, health, wellness
    else if (topic.includes("fitness") || topic.includes("health") || topic.includes("wellness")) {
      recommendations.primary.push("Instagram", "YouTube", "TikTok")
      recommendations.secondary.push("Pinterest")
      recommendations.experimental.push("Facebook Groups")
    }
    // Food, cooking, recipes
    else if (topic.includes("food") || topic.includes("cooking") || topic.includes("recipe")) {
      recommendations.primary.push("Instagram", "Pinterest", "TikTok")
      recommendations.secondary.push("YouTube")
      recommendations.experimental.push("Facebook")
    }
    // Travel, adventure
    else if (topic.includes("travel") || topic.includes("adventure")) {
      recommendations.primary.push("Instagram", "YouTube")
      recommendations.secondary.push("Pinterest", "TikTok")
      recommendations.experimental.push("Twitter")
    }
    // Art, design, creativity
    else if (topic.includes("art") || topic.includes("design") || topic.includes("creative")) {
      recommendations.primary.push("Instagram", "Pinterest")
      recommendations.secondary.push("YouTube", "TikTok")
      recommendations.experimental.push("Behance")
    }
    // Education, learning
    else if (topic.includes("education") || topic.includes("learning") || topic.includes("teach")) {
      recommendations.primary.push("YouTube", "LinkedIn")
      recommendations.secondary.push("Twitter", "Facebook")
      recommendations.experimental.push("TikTok")
    }
    // Default recommendations
    else {
      recommendations.primary.push("Instagram", "TikTok")
      recommendations.secondary.push("YouTube", "Twitter")
      recommendations.experimental.push("LinkedIn")
    }

    // Adjust based on audience age
    if (audience.ageGroups.includes("13-17") || audience.ageGroups.includes("18-24")) {
      if (!recommendations.primary.includes("TikTok")) {
        recommendations.primary.push("TikTok")
      }
      if (!recommendations.primary.includes("Instagram")) {
        recommendations.primary.push("Instagram")
      }
    }

    if (
      audience.ageGroups.includes("35-44") ||
      audience.ageGroups.includes("45-54") ||
      audience.ageGroups.includes("55+")
    ) {
      if (!recommendations.primary.includes("Facebook")) {
        recommendations.primary.push("Facebook")
      }
      if (!recommendations.primary.includes("YouTube")) {
        recommendations.primary.push("YouTube")
      }
    }

    return recommendations
  }

  // Generate content ideas based on niche, audience, and goal
  const getContentIdeas = () => {
    const topic = userStrategy.mainTopic.toLowerCase()
    const subTopic = userStrategy.subTopic.toLowerCase()
    const goal = userStrategy.goal.toLowerCase()

    const ideas = [
      `"Day in the life" content showing behind-the-scenes of your ${topic} work`,
      `Educational posts explaining key concepts in ${topic} and ${subTopic}`,
      "Q&A sessions addressing common questions from your audience",
      `Before/after transformations related to ${topic}`,
      "Client testimonials and success stories",
    ]

    if (goal.includes("product")) {
      ideas.push(
        "Product demonstrations and tutorials",
        "Limited-time offers and promotions",
        "Customer reviews and testimonials",
        "Product comparison videos",
        "Unboxing experiences",
      )
    }

    if (goal.includes("service")) {
      ideas.push(
        "Service process walkthroughs",
        "Client success stories and case studies",
        "Behind-the-scenes of service delivery",
        "Tips related to your service area",
        "FAQ sessions about your services",
      )
    }

    if (goal.includes("awareness")) {
      ideas.push(
        "Thought leadership articles and posts",
        "Industry news and trends analysis",
        "Collaborative content with other creators in your space",
        "Educational series about your topic",
        "Myth-busting content about common misconceptions",
      )
    }

    if (goal.includes("community")) {
      ideas.push(
        "Community challenges and contests",
        "User-generated content features",
        "Live sessions and community Q&As",
        "Member spotlights and success stories",
        "Polls and interactive discussions",
      )
    }

    return ideas
  }

  // Generate strategic recommendations based on goals and challenges
  const getStrategicRecommendations = () => {
    const recommendations = []

    // Based on goal
    if (userStrategy.goal === "product") {
      recommendations.push(
        "Focus on visual content that showcases your products in action",
        "Create tutorials and how-to content that demonstrates product value",
        "Implement a consistent product release calendar with teasers and launches",
        "Leverage user-generated content showing your products in use",
      )
    } else if (userStrategy.goal === "service") {
      recommendations.push(
        "Share client success stories and testimonials regularly",
        "Create educational content that establishes your expertise",
        "Develop a lead generation funnel with valuable free content",
        "Host live Q&A sessions to address potential client questions",
      )
    } else if (userStrategy.goal === "awareness") {
      recommendations.push(
        "Collaborate with complementary creators and brands",
        "Create shareable, educational infographics and carousel posts",
        "Participate actively in relevant community discussions",
        "Develop a consistent brand voice and visual identity",
      )
    } else if (userStrategy.goal === "community") {
      recommendations.push(
        "Create interactive content that encourages audience participation",
        "Establish regular community events or challenges",
        "Highlight community members and their contributions",
        "Create exclusive content or resources for your community",
      )
    }

    // Based on challenges
    if (userStrategy.challenges.some((c) => c.includes("time"))) {
      recommendations.push(
        "Implement a content batching system to create multiple posts in one session",
        "Use CampfireOS scheduling tools to automate posting",
        "Repurpose content across platforms to maximize efficiency",
      )
    }

    if (userStrategy.challenges.some((c) => c.includes("ideas"))) {
      recommendations.push(
        "Create content pillars to organize your topic areas",
        "Set up a content idea repository to collect inspiration",
        "Use CampfireOS AI content generator for inspiration",
      )
    }

    if (userStrategy.challenges.some((c) => c.includes("engagement"))) {
      recommendations.push(
        "Ask questions in your captions to encourage comments",
        "Respond promptly to all comments and messages",
        "Create more interactive content like polls and quizzes",
      )
    }

    if (userStrategy.challenges.some((c) => c.includes("growth"))) {
      recommendations.push(
        "Analyze your best-performing content and create more similar content",
        "Implement a hashtag strategy relevant to your niche",
        "Collaborate with other creators for cross-promotion",
      )
    }

    if (userStrategy.challenges.some((c) => c.includes("consistency"))) {
      recommendations.push(
        "Create a content calendar with planned posts",
        "Set specific days and times for content creation",
        "Use CampfireOS scheduling features to maintain consistency",
      )
    }

    return recommendations
  }

  const platformRecs = getPlatformRecommendations()
  const contentIdeas = getContentIdeas()
  const strategicRecommendations = getStrategicRecommendations()

  // Get content plan formatted date if available
  const contentPlanDate = contentPlan
    ? new Date(contentPlan.generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Image className="h-4 w-4" />
      case "tiktok":
        return <Video className="h-4 w-4" />
      case "twitter":
        return <FileText className="h-4 w-4" />
      case "facebook":
        return <Megaphone className="h-4 w-4" />
      case "linkedin":
        return <Clipboard className="h-4 w-4" />
      case "youtube":
        return <Video className="h-4 w-4" />
      case "pinterest":
        return <Image className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      case "carousel":
        return <BarChart className="h-4 w-4" />
      case "story":
        return <Clock className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Main UI with optional regenerating overlay
  return (
    <div className="relative">
      {generatingPlan && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Regenerating Your Strategy</h1>
          <p className="text-muted-foreground max-w-md mb-8 text-center">
            Our AI is analyzing your information and crafting an updated social media strategy for your business.
          </p>
          <div className="w-full max-w-md bg-muted h-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full animate-pulse" style={{ width: "90%" }}></div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Social Media Strategy</h1>
            <p className="text-gray-600">
              Personalized strategy for {userStrategy.mainTopic} • Generated on {formattedDate}
            </p>
          </div>
          <Button
            onClick={async () => {
              try {
                setGeneratingPlan(true)
                const surveyData = JSON.parse(localStorage.getItem("onboardingSurvey") || "")
                const generatedStrategy = await generateStrategy(surveyData)
                await updateStrategy(generatedStrategy)
                setStrategy(generatedStrategy)
              } catch (error) {
                console.error("Error regenerating strategy:", error)
              } finally {
                setGeneratingPlan(false)
              }
            }}
            disabled={generatingPlan}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {generatingPlan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Strategy
              </>
            )}
          </Button>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Goal Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200 h-[180px] overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-lg font-semibold">Goal</h2>
            </div>
            <ul className="space-y-2">
              <li className="flex items-baseline gap-2">
                <span className="text-orange-500 text-sm">•</span>
                <span className="text-sm">Type: {userStrategy.goal}</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-orange-500 text-sm">•</span>
                <span className="text-sm">Focus: {userStrategy.mainTopic}</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-orange-500 text-sm">•</span>
                <span className="text-sm line-clamp-1">Target: {userStrategy.subTopic}</span>
              </li>
            </ul>
          </div>

          {/* Target Audience Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200 h-[180px] overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👥</span>
              <h2 className="text-lg font-semibold">Target Audience</h2>
            </div>
            <ul className="space-y-2">
              <li className="flex items-baseline gap-2">
                <span className="text-orange-500 text-sm">•</span>
                <span className="text-sm">Age: {userStrategy.targetAudience.ageGroups.join(", ")}</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-orange-500 text-sm">•</span>
                <span className="text-sm">Gender: {userStrategy.targetAudience.gender}</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-orange-500 text-sm">•</span>
                <span className="text-sm line-clamp-1">Interests: {userStrategy.targetAudience.interests.join(", ")}</span>
              </li>
            </ul>
          </div>

          {/* Current Platforms Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200 h-[180px] overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📱</span>
              <h2 className="text-lg font-semibold">Current Platforms</h2>
            </div>
            {userStrategy.currentChannels && userStrategy.currentChannels.length > 0 ? (
              <ul className="space-y-2">
                {userStrategy.currentChannels.map((channel) => (
                  <li key={channel} className="flex items-baseline gap-2">
                    <span className="text-orange-500 text-sm">•</span>
                    <span className="text-sm capitalize">{getPlatformNames([channel])[0]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No platforms selected yet</p>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="content-ideas">Content Ideas</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Strategy Overview</h2>
            <p className="text-gray-600 mb-6">Your personalized social media strategy based on your goals and niche</p>
            
            <h3 className="font-medium mb-2">Executive Summary</h3>
            <p className="text-gray-600 mb-6">Based on your focus on {userStrategy.mainTopic} and your goal to build {userStrategy.goal}, we've created a comprehensive social media strategy to help you overcome your challenges and achieve your objectives.</p>

            <h3 className="font-medium mb-2">Key Recommendations</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">•</span>
                Focus on {userStrategy.currentChannels.join(", ")} as your primary platforms
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">•</span>
                Create a mix of educational, entertaining, and promotional content
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">•</span>
                Maintain a consistent posting schedule of 3-5 times per week
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">•</span>
                Engage with your audience by responding to comments and messages
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">•</span>
                Use analytics to track performance and adjust your strategy accordingly
              </li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Content Mix</h4>
                <ul className="space-y-1 text-sm">
                  <li>40% Educational</li>
                  <li>30% Entertaining</li>
                  <li>20% Inspirational</li>
                  <li>10% Promotional</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Platform Focus</h4>
                <ul className="space-y-1 text-sm">
                  <li>Primary: Instagram, YouTube</li>
                  <li>Secondary: Pinterest</li>
                  <li>Experimental: Facebook Groups</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Posting Frequency</h4>
                <ul className="space-y-1 text-sm">
                  <li>Primary: 3-5x weekly</li>
                  <li>Secondary: 1-2x weekly</li>
                  <li>Stories: Daily</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Target Audience Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-3">Demographics</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Age Groups</h4>
                    <p className="mt-1">{userStrategy.targetAudience.ageGroups.join(", ")}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Gender</h4>
                    <p className="mt-1">{userStrategy.targetAudience.gender}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Location</h4>
                    <p className="mt-1">{userStrategy.targetAudience.location}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Interests & Behaviors</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Primary Interests</h4>
                    <ul className="mt-1 space-y-1">
                      {userStrategy.targetAudience.interests.map((interest) => (
                        <li key={interest} className="flex items-center gap-2">
                          <span className="text-orange-500">•</span>
                          {interest}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {userStrategy.targetAudience.customInterests?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Custom Interests</h4>
                      <ul className="mt-1 space-y-1">
                        {userStrategy.targetAudience.customInterests.map((interest) => (
                          <li key={interest} className="flex items-center gap-2">
                            <span className="text-orange-500">•</span>
                            {interest}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Platform Strategy</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-3">Current Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userStrategy.currentChannels.map((platform) => (
                    <div key={platform} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getPlatformIcon(platform)}
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Recommended Platform Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Primary Focus</h4>
                    <ul className="space-y-1">
                      {platformRecs.primary.map((platform) => (
                        <li key={platform} className="flex items-center gap-2">
                          <span className="text-orange-500">•</span>
                          {platform}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Secondary Focus</h4>
                    <ul className="space-y-1">
                      {platformRecs.secondary.map((platform) => (
                        <li key={platform} className="flex items-center gap-2">
                          <span className="text-orange-500">•</span>
                          {platform}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Experimental</h4>
                    <ul className="space-y-1">
                      {platformRecs.experimental.map((platform) => (
                        <li key={platform} className="flex items-center gap-2">
                          <span className="text-orange-500">•</span>
                          {platform}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content-ideas" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Content Ideas</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-3">Recommended Content Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contentIdeas.map((idea, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <p>{idea}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Content Mix Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2">Educational (40%)</h4>
                    <p className="text-sm text-gray-600">Focus on teaching and informing your audience about {userStrategy.mainTopic}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h4 className="font-medium mb-2">Entertaining (30%)</h4>
                    <p className="text-sm text-gray-600">Create engaging and fun content to keep your audience interested</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <h4 className="font-medium mb-2">Inspirational (20%)</h4>
                    <p className="text-sm text-gray-600">Share success stories and motivational content</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2">Promotional (10%)</h4>
                    <p className="text-sm text-gray-600">Promote your offerings and services</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Strategic Recommendations</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-3">Goal-Based Recommendations</h3>
                <div className="p-4 border rounded-lg mb-6">
                  <h4 className="font-medium mb-2">Primary Goal: {userStrategy.goal}</h4>
                  <p className="text-gray-600 mb-4">{userStrategy.goalDetails}</p>
                  <ul className="space-y-2">
                    {strategicRecommendations.slice(0, 4).map((rec, index) => (
                      <li key={index} className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Challenge-Based Solutions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userStrategy.challenges.map((challenge, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Challenge: {challenge}</h4>
                      <ul className="space-y-2">
                        {strategicRecommendations.slice(4 + index * 3, 7 + index * 3).map((rec, recIndex) => (
                          <li key={recIndex} className="flex items-baseline gap-2">
                            <span className="text-orange-500">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Action Plan</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-3">Implementation Timeline</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Week 1-2: Setup & Foundation</h4>
                    <ul className="space-y-2">
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Set up and optimize profiles on {userStrategy.currentChannels.join(", ")}</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Create content calendar and posting schedule</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Develop initial content batch focusing on {userStrategy.mainTopic}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Week 3-4: Content Creation & Engagement</h4>
                    <ul className="space-y-2">
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Begin regular posting schedule</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Implement engagement strategy</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500">•</span>
                        <span>Start tracking metrics and engagement rates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Success Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Growth Metrics</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Follower growth rate</li>
                      <li>Reach and impressions</li>
                      <li>Profile visits</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Engagement Metrics</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Engagement rate per post</li>
                      <li>Comments and saves</li>
                      <li>Story interactions</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Content Performance</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Best performing content types</li>
                      <li>Optimal posting times</li>
                      <li>Audience retention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Strategy
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Strategy
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={() => router.push('/content-plan')}>
            Create Content Plan
          </Button>
        </div>
      </div>
    </div>
  )
}

