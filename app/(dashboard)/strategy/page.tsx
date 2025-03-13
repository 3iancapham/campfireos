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
} from "lucide-react"

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
  const [strategy, setStrategy] = useState<UserStrategy | null>(null)
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // In a real app, this would be fetched from an API
    const savedStrategy = localStorage.getItem("userStrategy")
    if (savedStrategy) {
      setStrategy(JSON.parse(savedStrategy))
    }

    // Check if we already have a content plan
    const savedContentPlan = localStorage.getItem("contentPlan")
    if (savedContentPlan) {
      setContentPlan(JSON.parse(savedContentPlan))
    }

    setLoading(false)
  }, [])

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

  if (loading) {
    return <div className="p-8">Loading your strategy...</div>
  }

  if (!strategy) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Your Social Media Strategy</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No strategy found</h2>
            <p className="text-muted-foreground mb-6">
              Complete the onboarding process to generate your personalized social media strategy.
            </p>
            <Button onClick={startOnboarding}>Complete Onboarding</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format the date
  const formattedDate = new Date(strategy.generatedAt).toLocaleDateString("en-US", {
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
    const topic = strategy.mainTopic.toLowerCase()
    const subTopic = strategy.subTopic.toLowerCase()
    const audience = strategy.targetAudience

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
    const topic = strategy.mainTopic.toLowerCase()
    const subTopic = strategy.subTopic.toLowerCase()
    const goal = strategy.goal.toLowerCase()

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
    if (strategy.goal === "product") {
      recommendations.push(
        "Focus on visual content that showcases your products in action",
        "Create tutorials and how-to content that demonstrates product value",
        "Implement a consistent product release calendar with teasers and launches",
        "Leverage user-generated content showing your products in use",
      )
    } else if (strategy.goal === "service") {
      recommendations.push(
        "Share client success stories and testimonials regularly",
        "Create educational content that establishes your expertise",
        "Develop a lead generation funnel with valuable free content",
        "Host live Q&A sessions to address potential client questions",
      )
    } else if (strategy.goal === "awareness") {
      recommendations.push(
        "Collaborate with complementary creators and brands",
        "Create shareable, educational infographics and carousel posts",
        "Participate actively in relevant community discussions",
        "Develop a consistent brand voice and visual identity",
      )
    } else if (strategy.goal === "community") {
      recommendations.push(
        "Create interactive content that encourages audience participation",
        "Establish regular community events or challenges",
        "Highlight community members and their contributions",
        "Create exclusive content or resources for your community",
      )
    }

    // Based on challenges
    if (strategy.challenges.some((c) => c.includes("time"))) {
      recommendations.push(
        "Implement a content batching system to create multiple posts in one session",
        "Use CampfireOS scheduling tools to automate posting",
        "Repurpose content across platforms to maximize efficiency",
      )
    }

    if (strategy.challenges.some((c) => c.includes("ideas"))) {
      recommendations.push(
        "Create content pillars to organize your topic areas",
        "Set up a content idea repository to collect inspiration",
        "Use CampfireOS AI content generator for inspiration",
      )
    }

    if (strategy.challenges.some((c) => c.includes("engagement"))) {
      recommendations.push(
        "Ask questions in your captions to encourage comments",
        "Respond promptly to all comments and messages",
        "Create more interactive content like polls and quizzes",
      )
    }

    if (strategy.challenges.some((c) => c.includes("growth"))) {
      recommendations.push(
        "Analyze your best-performing content and create more similar content",
        "Implement a hashtag strategy relevant to your niche",
        "Collaborate with other creators for cross-promotion",
      )
    }

    if (strategy.challenges.some((c) => c.includes("consistency"))) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Social Media Strategy</h1>
        <p className="text-muted-foreground">
          Personalized strategy for {strategy.mainTopic}: {strategy.subTopic} • Generated on {formattedDate}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">{strategy.goal}</p>
            <p className="text-sm text-muted-foreground mt-1">{strategy.goalDetails}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">
                {strategy.targetAudience.ageGroups.length > 0
                  ? strategy.targetAudience.ageGroups.join(", ")
                  : "All ages"}
              </span>{" "}
              •
              <span className="capitalize">
                {" "}
                {strategy.targetAudience.gender === "all" ? "All genders" : strategy.targetAudience.gender}
              </span>
            </p>
            <p className="text-sm mt-1">
              Interested in{" "}
              {strategy.targetAudience.interests.length > 0
                ? getInterestNames(strategy.targetAudience.interests).join(", ")
                : "various topics"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Current Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {strategy.currentChannels.length > 0
                ? getPlatformNames(strategy.currentChannels).join(", ")
                : "No platforms selected"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content Ideas</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="plan" disabled={!contentPlan && !generatingPlan}>
            Plan {generatingPlan && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Overview</CardTitle>
              <CardDescription>Your personalized social media strategy based on your goals and niche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your focus on{" "}
                  <strong>
                    {strategy.mainTopic}: {strategy.subTopic}
                  </strong>{" "}
                  and your goal to <strong>{strategy.goal}</strong>, we've created a comprehensive social media strategy
                  to help you overcome your challenges and achieve your objectives.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Key Recommendations</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                    <span>Focus on {platformRecs.primary.join(", ")} as your primary platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                    <span>Create a mix of educational, entertaining, and promotional content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                    <span>Maintain a consistent posting schedule of 3-5 times per week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                    <span>Engage with your audience by responding to comments and messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                    <span>Use analytics to track performance and adjust your strategy accordingly</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Content Mix</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>40% Educational</li>
                    <li>30% Entertaining</li>
                    <li>20% Inspirational</li>
                    <li>10% Promotional</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Platform Focus</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>Primary: {platformRecs.primary.slice(0, 2).join(", ")}</li>
                    <li>Secondary: {platformRecs.secondary.slice(0, 2).join(", ")}</li>
                    <li>Experimental: {platformRecs.experimental[0]}</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Posting Frequency</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>Primary: 3-5x weekly</li>
                    <li>Secondary: 1-2x weekly</li>
                    <li>Stories: Daily</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Target Audience Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your ideal audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Demographics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      {strategy.targetAudience.ageGroups.length > 0 ? (
                        strategy.targetAudience.ageGroups.map((age) => (
                          <div key={age} className="flex items-center justify-between">
                            <span className="text-sm">{age}</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width:
                                    age === "18-24" || age === "25-34"
                                      ? "80%"
                                      : age === "35-44"
                                        ? "60%"
                                        : age === "13-17"
                                          ? "70%"
                                          : "50%",
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">All age groups</p>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Gender</h4>
                    <div className="space-y-2">
                      {strategy.targetAudience.gender === "all" ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Female</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "50%" }}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Male</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Non-binary</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "5%" }}></div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{strategy.targetAudience.gender}</span>
                          <div className="w-2/3 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Location</h4>
                    <div className="space-y-2">
                      {strategy.targetAudience.location === "global" ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">North America</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "40%" }}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Europe</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "30%" }}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Asia</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "20%" }}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Other</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: "10%" }}></div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{strategy.targetAudience.location}</span>
                          <div className="w-2/3 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Interests & Behaviors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {strategy.targetAudience.interests.length > 0 ? (
                    getInterestNames(strategy.targetAudience.interests).map((interest) => (
                      <div key={interest} className="bg-primary/10 text-primary px-3 py-2 rounded-md text-sm">
                        {interest}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-full">No specific interests selected</p>
                  )}

                  {strategy.targetAudience.customInterests.map((interest, index) => (
                    <div key={`custom-${index}`} className="bg-primary/10 text-primary px-3 py-2 rounded-md text-sm">
                      {interest}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Audience Insights</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Content Preferences</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your audience demographics and interests, they likely prefer
                      {strategy.targetAudience.ageGroups.includes("13-17") ||
                      strategy.targetAudience.ageGroups.includes("18-24")
                        ? " short-form video content, interactive stories, and visually engaging posts."
                        : strategy.targetAudience.ageGroups.includes("25-34")
                          ? " a mix of video and image content, with practical information and inspirational stories."
                          : " in-depth content with valuable information, how-to guides, and industry insights."}
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Platform Usage</h4>
                    <p className="text-sm text-muted-foreground">
                      Your target audience is most active on {platformRecs.primary.join(", ")}. They typically engage
                      with content during
                      {strategy.targetAudience.ageGroups.includes("13-17") ||
                      strategy.targetAudience.ageGroups.includes("18-24")
                        ? " evenings and late night hours."
                        : strategy.targetAudience.ageGroups.includes("25-34")
                          ? " lunch breaks, commuting hours, and evenings."
                          : " mornings and early evenings."}
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Pain Points & Motivations</h4>
                    <p className="text-sm text-muted-foreground">
                      People interested in {strategy.mainTopic} are often looking for
                      {strategy.goal === "product"
                        ? " solutions to specific problems and ways to improve their quality of life."
                        : strategy.goal === "service"
                          ? " expert guidance and specialized knowledge to address their challenges."
                          : strategy.goal === "awareness"
                            ? " educational content and thought leadership to expand their understanding."
                            : " community connection and shared experiences with like-minded individuals."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Platforms</CardTitle>
              <CardDescription>The best social media platforms for your {strategy.mainTopic} focus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Primary Platforms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {platformRecs.primary.map((platform) => (
                    <div key={platform} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {platform === "Instagram" && <MessageSquare className="h-4 w-4 text-primary" />}
                          {platform === "Twitter" && <MessageSquare className="h-4 w-4 text-primary" />}
                          {platform === "Facebook" && <Users className="h-4 w-4 text-primary" />}
                          {platform === "LinkedIn" && <Users className="h-4 w-4 text-primary" />}
                          {platform === "TikTok" && <TrendingUp className="h-4 w-4 text-primary" />}
                          {platform === "YouTube" && <TrendingUp className="h-4 w-4 text-primary" />}
                          {platform === "Pinterest" && <TrendingUp className="h-4 w-4 text-primary" />}
                          {platform === "Twitch" && <TrendingUp className="h-4 w-4 text-primary" />}
                        </div>
                        <h4 className="font-medium">{platform}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {platform === "Instagram" && "Perfect for visual content and reaching a younger audience"}
                        {platform === "Twitter" && "Great for news, updates, and engaging in industry conversations"}
                        {platform === "Facebook" && "Ideal for community building and reaching a diverse audience"}
                        {platform === "LinkedIn" && "Best for B2B connections and professional content"}
                        {platform === "TikTok" && "Excellent for short-form video and trending content"}
                        {platform === "YouTube" && "Ideal for in-depth tutorials and educational content"}
                        {platform === "Pinterest" && "Perfect for inspirational and DIY content"}
                        {platform === "Twitch" && "Great for live streaming and gaming content"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Secondary Platforms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {platformRecs.secondary.map((platform) => (
                    <div key={platform} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {platform === "Instagram" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                          {platform === "Twitter" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                          {platform === "Facebook" && <Users className="h-4 w-4 text-muted-foreground" />}
                          {platform === "LinkedIn" && <Users className="h-4 w-4 text-muted-foreground" />}
                          {platform === "TikTok" && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                          {platform === "YouTube" && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                          {platform === "Pinterest" && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                          {platform === "Reddit" && <Users className="h-4 w-4 text-muted-foreground" />}
                          {platform === "Discord" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <h4 className="font-medium">{platform}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {platform === "Instagram" && "Supplement your strategy with visual content"}
                        {platform === "Twitter" && "Use for quick updates and industry engagement"}
                        {platform === "Facebook" && "Good for community building and paid advertising"}
                        {platform === "LinkedIn" && "Use for professional networking and B2B content"}
                        {platform === "TikTok" && "Experiment with trending content formats"}
                        {platform === "YouTube" && "Create occasional in-depth video content"}
                        {platform === "Pinterest" && "Share visual inspiration related to your niche"}
                        {platform === "Reddit" && "Engage in niche communities and discussions"}
                        {platform === "Discord" && "Build a dedicated community space"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Experimental Platforms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {platformRecs.experimental.map((platform) => (
                    <div key={platform} className="border rounded-lg p-4 border-dashed">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                          {platform === "Twitter" && <MessageSquare className="h-4 w-4 text-primary/70" />}
                          {platform === "Facebook" && <Users className="h-4 w-4 text-primary/70" />}
                          {platform === "LinkedIn" && <Users className="h-4 w-4 text-primary/70" />}
                          {platform === "TikTok" && <TrendingUp className="h-4 w-4 text-primary/70" />}
                          {platform === "Instagram" && <MessageSquare className="h-4 w-4 text-primary/70" />}
                          {platform === "Snapchat" && <MessageSquare className="h-4 w-4 text-primary/70" />}
                          {platform === "Behance" && <TrendingUp className="h-4 w-4 text-primary/70" />}
                          {platform === "Facebook Groups" && <Users className="h-4 w-4 text-primary/70" />}
                        </div>
                        <h4 className="font-medium">{platform}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {platform === "Twitter" && "Test engagement with industry conversations"}
                        {platform === "Facebook" && "Experiment with groups and community features"}
                        {platform === "LinkedIn" && "Try thought leadership content if relevant to your niche"}
                        {platform === "TikTok" && "Experiment with trending formats and challenges"}
                        {platform === "Instagram" && "Test different content formats like Reels and Stories"}
                        {platform === "Snapchat" && "Reach younger audiences with ephemeral content"}
                        {platform === "Behance" && "Showcase your creative portfolio and process"}
                        {platform === "Facebook Groups" && "Build a dedicated community around your topic"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Ideas</CardTitle>
              <CardDescription>Suggested content types for your {strategy.mainTopic} focus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentIdeas.map((idea, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{idea}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {index % 3 === 0 && "Builds credibility and showcases your expertise"}
                          {index % 3 === 1 && "Engages your audience and encourages interaction"}
                          {index % 3 === 2 && "Demonstrates value and builds trust with your audience"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
              <CardDescription>Actionable strategies based on your goals and challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Goal-Based Strategies</h3>
                  <div className="space-y-3">
                    {strategicRecommendations.slice(0, 4).map((recommendation, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clipboard className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Challenge Solutions</h3>
                  <div className="space-y-3">
                    {strategicRecommendations.slice(4).map((recommendation, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clipboard className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Implementation Timeline</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Week 1-2: Foundation</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Set up and optimize profiles on primary platforms</li>
                        <li>• Create content pillars and initial content calendar</li>
                        <li>• Establish brand voice and visual identity guidelines</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Week 3-4: Content Creation</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Batch create initial content for each platform</li>
                        <li>• Set up scheduling and automation tools</li>
                        <li>• Begin engaging with relevant communities</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Month 2: Growth & Optimization</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Analyze initial performance metrics</li>
                        <li>• Refine content strategy based on data</li>
                        <li>• Expand to secondary platforms if appropriate</li>
                        <li>• Begin collaboration outreach</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Month 3: Scaling & Refinement</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Implement advanced content strategies</li>
                        <li>• Consider paid promotion for best-performing content</li>
                        <li>• Develop community engagement initiatives</li>
                        <li>• Review and update strategy based on results</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          {contentPlan ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Plan</CardTitle>
                  <CardDescription>
                    Your personalized content plan for {strategy.mainTopic} • Generated on {contentPlanDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Content Themes</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {contentPlan.themes.map((theme) => (
                          <div key={theme.id} className={`p-4 rounded-lg ${theme.color}`}>
                            <h4 className="font-medium mb-1">{theme.name}</h4>
                            <p className="text-xs">{theme.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {contentPlan.weeks.map((week) => (
                <Card key={week.weekNumber}>
                  <CardHeader>
                    <CardTitle>Week {week.weekNumber}</CardTitle>
                    <CardDescription>
                      {week.posts.length} posts scheduled across{" "}
                      {[...new Set(week.posts.map((post) => post.platform))].length} platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {week.posts.map((post) => (
                        <div key={post.id} className="p-4 border rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {getPlatformIcon(post.platform)}
                                <span className="text-sm font-medium capitalize">{post.platform}</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                {getContentTypeIcon(post.contentType)}
                                <span className="text-sm capitalize">{post.contentType}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.suggestedDate} at {post.suggestedTime}
                            </div>
                          </div>
                          <h4 className="font-medium mb-2">{post.topic}</h4>
                          <p className="text-sm text-muted-foreground">{post.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <div className="text-xs px-2 py-1 rounded-full bg-muted">
                              {post.status === "draft"
                                ? "Draft"
                                : post.status === "scheduled"
                                  ? "Scheduled"
                                  : "Published"}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Schedule
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                </div>
                <h2 className="text-xl font-medium mb-2">No content plan found</h2>
                <p className="text-muted-foreground mb-6">
                  Generate a content plan based on your strategy to get started.
                </p>
                <Button onClick={handleCreateContentPlan} disabled={generatingPlan}>
                  {generatingPlan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    "Generate Content Plan"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Strategy
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Strategy
        </Button>
        <Button className="gap-2" onClick={handleCreateContentPlan} disabled={generatingPlan}>
          <BarChart2 className="h-4 w-4" />
          {generatingPlan ? "Generating Plan..." : "Create Content Plan"}
        </Button>
      </div>
    </div>
  )
}

