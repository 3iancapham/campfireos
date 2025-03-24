"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { syncUserDataToLocalStorage } from '@/lib/utils/data-sync'
import { UserData, UserStrategy, ContentPlan, ContentWeek, ContentPost, ContentTheme } from '@/lib/types'
import { FixLocalStorageButton } from '@/components/fix-local-storage'

export default function StrategyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { userData, loading: dataLoading, error, updateStrategy } = useUserData()
  const [strategy, setStrategy] = useState<UserStrategy | null>(null)
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [rawAnthropicResponse, setRawAnthropicResponse] = useState<string>("")
  const [activeTab, setActiveTab] = useState("content")

  // Add debug logs
  console.log('Debug - Auth State:', { user, authLoading });
  console.log('Debug - User Data:', { userData, dataLoading, error });
  console.log('Debug - Local Strategy State:', { strategy });
  console.log('Debug - User Data Strategy:', userData?.strategy);

  // Set active tab from URL parameter if present
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['content', 'audience', 'platforms', 'recommendations', 'plan'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const checkExistingStrategy = async () => {
      try {
        // Only check for existing strategy, don't generate
        if (userData?.strategy && Object.keys(userData.strategy).length > 0) {
          console.log("Strategy exists in userData, using it");
          const strategyWithGoalDetails = {
            ...userData.strategy,
            goalDetails: ''
          } as UserStrategy;
          setStrategy(strategyWithGoalDetails);
          
          const savedRawResponse = localStorage.getItem("rawAnthropicResponse");
          if (savedRawResponse) {
            setRawAnthropicResponse(savedRawResponse);
          }
        }
      } catch (error) {
        console.error("Error checking strategy:", error);
      }
    };

    if (!dataLoading && userData) {
      checkExistingStrategy();
    }
  }, [dataLoading, userData]);

  // Separate function to generate strategy
  const generateNewStrategy = async () => {
    try {
      console.log("Starting strategy generation...");
      setGeneratingPlan(true);

      // Get survey data
      const surveyDataStr = localStorage.getItem("onboardingSurvey");
      if (!surveyDataStr) {
        console.log("No survey data found");
        setGeneratingPlan(false);
        return;
      }

      const surveyData = JSON.parse(surveyDataStr);
      
      // Check if survey is completed
      if (!surveyData.surveyCompletedAt) {
        console.log("Survey not completed yet");
        setGeneratingPlan(false);
        return;
      }

      console.log("Survey data being sent to API:", JSON.stringify(surveyData, null, 2));
      console.log("Calling strategy API...");

      // Call the server-side API route with a longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("Raw API response:", JSON.stringify(data, null, 2));
      
      if (!data || !data.strategy) {
        console.error("Invalid API response:", data);
        throw new Error(data.error || 'No strategy received from API');
      }

      const { strategy: generatedStrategy, rawResponse } = data;

      // Validate the generated strategy
      if (!generatedStrategy.mainTopic || !generatedStrategy.subTopic) {
        console.error("Invalid strategy data:", generatedStrategy);
        throw new Error('Generated strategy is missing required fields');
      }

      console.log("Strategy generated successfully:", JSON.stringify(generatedStrategy, null, 2));

      // Save the strategy to Firestore
      const saved = await updateStrategy(generatedStrategy);
      if (!saved) {
        throw new Error('Failed to save strategy to Firestore');
      }

      // Update local state
      setStrategy(generatedStrategy);
      
      setRawAnthropicResponse(rawResponse || "No raw response available");
      localStorage.setItem("rawAnthropicResponse", rawResponse || "");
      
    } catch (error) {
      console.error("Error generating strategy:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      alert(error instanceof Error ? error.message : "Failed to generate strategy. Please check your connection and try again.");
    } finally {
      setGeneratingPlan(false);
    }
  };

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

  // Show no strategy state when there's no strategy in both userData and local state
  const userDataStrategy = userData?.strategy as UserStrategy | null;
  console.log('Debug - User Data Strategy (after cast):', userDataStrategy);
  if (!userDataStrategy && !strategy) {
    console.log('Debug - No Strategy Found condition met:', { userDataStrategy, strategy });
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">No Strategy Found</h2>
          <p className="mb-4 text-gray-600">
            Please complete the onboarding process to generate your strategy.
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/onboarding')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Onboarding
            </Button>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Already completed onboarding?</p>
              <FixLocalStorageButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Use either the local strategy state or userData.strategy, ensuring type safety
  const displayStrategy = strategy || userDataStrategy;
  if (!displayStrategy) {
    return null;
  }

  // Format the date
  const formattedDate = new Date(displayStrategy.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  // Replace the direct destructuring with safe access
  const userStrategy = userData?.strategy || null;

  // Get platform names from IDs with proper typing
  const getPlatformNames = (platformIds: string[]): string[] => {
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

    return platformIds.map((id: string) => platformMap[id] || id)
  }

  // Get interest names from IDs with proper typing
  const getInterestNames = (interestIds: string[]): string[] => {
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

    return interestIds.map((id: string) => interestMap[id] || id)
  }

  // Add type safety check for userStrategy
  if (!userStrategy) {
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

  // Generate platform recommendations based on niche and audience
  const getPlatformRecommendations = () => {
    const topic = displayStrategy.mainTopic.toLowerCase()
    const subTopic = displayStrategy.subTopic.toLowerCase()
    const audience = displayStrategy.targetAudience

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
    const topic = displayStrategy.mainTopic.toLowerCase()
    const subTopic = displayStrategy.subTopic.toLowerCase()
    const goal = displayStrategy.goal.toLowerCase()

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
    if (displayStrategy.goal === "product") {
      recommendations.push(
        "Focus on visual content that showcases your products in action",
        "Create tutorials and how-to content that demonstrates product value",
        "Implement a consistent product release calendar with teasers and launches",
        "Leverage user-generated content showing your products in use",
      )
    } else if (displayStrategy.goal === "service") {
      recommendations.push(
        "Share client success stories and testimonials regularly",
        "Create educational content that establishes your expertise",
        "Develop a lead generation funnel with valuable free content",
        "Host live Q&A sessions to address potential client questions",
      )
    } else if (displayStrategy.goal === "awareness") {
      recommendations.push(
        "Collaborate with complementary creators and brands",
        "Create shareable, educational infographics and carousel posts",
        "Participate actively in relevant community discussions",
        "Develop a consistent brand voice and visual identity",
      )
    } else if (displayStrategy.goal === "community") {
      recommendations.push(
        "Create interactive content that encourages audience participation",
        "Establish regular community events or challenges",
        "Highlight community members and their contributions",
        "Create exclusive content or resources for your community",
      )
    }

    // Based on challenges
    if (displayStrategy.challenges.some((c) => c.includes("time"))) {
      recommendations.push(
        "Implement a content batching system to create multiple posts in one session",
        "Use CampfireOS scheduling tools to automate posting",
        "Repurpose content across platforms to maximize efficiency",
      )
    }

    if (displayStrategy.challenges.some((c) => c.includes("ideas"))) {
      recommendations.push(
        "Create content pillars to organize your topic areas",
        "Set up a content idea repository to collect inspiration",
        "Use CampfireOS AI content generator for inspiration",
      )
    }

    if (displayStrategy.challenges.some((c) => c.includes("engagement"))) {
      recommendations.push(
        "Ask questions in your captions to encourage comments",
        "Respond promptly to all comments and messages",
        "Create more interactive content like polls and quizzes",
      )
    }

    if (displayStrategy.challenges.some((c) => c.includes("growth"))) {
      recommendations.push(
        "Analyze your best-performing content and create more similar content",
        "Implement a hashtag strategy relevant to your niche",
        "Collaborate with other creators for cross-promotion",
      )
    }

    if (displayStrategy.challenges.some((c) => c.includes("consistency"))) {
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

  // Now, let's update the regenerate strategy function
  const regenerateStrategy = async () => {
    try {
      console.log("Starting strategy regeneration...");
      setGeneratingPlan(true);
      setActiveTab("anthropic"); // Switch to the Anthropic tab to show the raw response
      
      // Get survey data
      const surveyDataStr = localStorage.getItem("onboardingSurvey");
      if (!surveyDataStr) {
        console.log("No survey data found");
        alert("No survey data found. Please complete the onboarding process first.");
        setGeneratingPlan(false);
        return;
      }
      
      const surveyData = JSON.parse(surveyDataStr);
      console.log("Survey data loaded, calling API...");
      
      // Call the server-side API route with a single timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("API call timeout reached");
        controller.abort();
      }, 60000); // 60 second timeout
      
      try {
        const response = await fetch('/api/strategy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(surveyData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response received:", data);
        
        if (!data || !data.strategy) {
          console.error("Invalid API response:", data);
          throw new Error(data.error || 'No strategy received from API');
        }

        const { strategy: generatedStrategy, rawResponse } = data;
        
        console.log("Strategy generated successfully from API");
        
        // Add goalDetails to match the local UserStrategy type
        const strategyWithGoalDetails = {
          ...generatedStrategy,
          goalDetails: ''  // Add the missing field required by the local type
        } as UserStrategy;  // Type assertion to local UserStrategy type
        
        // Update state and Firestore
        await updateStrategy(generatedStrategy);
        console.log("Strategy updated in Firestore");
        
        setStrategy(strategyWithGoalDetails);
        console.log("Strategy state updated");
        
        // Store the raw response
        setRawAnthropicResponse(rawResponse || "No raw response available");
        localStorage.setItem("rawAnthropicResponse", rawResponse || "");
        console.log("Raw response saved");
        
      } catch (apiError) {
        console.error("API call failed:", apiError);
        if (apiError instanceof Error) {
          if (apiError.name === 'AbortError') {
            alert("Strategy generation timed out. Please try again. The process may take up to 60 seconds.");
          } else {
            alert(`Failed to regenerate strategy: ${apiError.message}`);
          }
        } else {
          alert("Failed to regenerate strategy: API call failed. Please check your connection and try again.");
        }
      }
      
      // Set the generating plan to false
      setGeneratingPlan(false);
      console.log("Strategy regeneration complete");
      
    } catch (error) {
      console.error("Error regenerating strategy:", error);
      alert("Error regenerating strategy. Please try again.");
      setGeneratingPlan(false);
    }
  };

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
              Personalized strategy for {user?.displayName || "Your Brand"} • Generated on {formattedDate}
            </p>
          </div>
          <div className="flex gap-2">
          <Button
              onClick={regenerateStrategy}
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
                {userStrategy.currentChannels.map((channel: string) => (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="anthropic" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Raw Anthropic Response</h2>
            <p className="text-gray-600 mb-6">This is the raw response from the Anthropic API that was used to generate your strategy.</p>
            
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap text-sm">{rawAnthropicResponse}</pre>
            </div>
          </TabsContent>

          <TabsContent value="content" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Content Strategy</h2>
            <p className="text-gray-600 mb-6">Your personalized content strategy based on your goals and niche</p>
            
            <h3 className="font-medium mb-4">Content Pillars</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Use the contentStrategy field from the updated UserStrategy type */}
              {(userStrategy.contentStrategy?.pillars || []).map((pillar: { name: string; description: string; themes: string[] }, index: number) => (
                <div key={index} className={`p-4 border rounded-lg ${index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-purple-50' : 'bg-orange-50'}`}>
                  <h4 className="font-medium mb-2">Pillar {index + 1}: {pillar.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{pillar.description}</p>
            <ul className="space-y-2">
                    {(pillar.themes || []).length > 0 ? (
                      pillar.themes.map((theme: string, themeIndex: number) => (
                        <li key={themeIndex} className="flex items-baseline gap-2">
                          <span className={`${index === 0 ? 'text-blue-500' : index === 1 ? 'text-purple-500' : 'text-orange-500'} text-sm`}>•</span>
                          <span className="text-sm">{theme}</span>
              </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-baseline gap-2">
                          <span className={`${index === 0 ? 'text-blue-500' : index === 1 ? 'text-purple-500' : 'text-orange-500'} text-sm`}>•</span>
                          <span className="text-sm">{index === 0 ? 'Introduction to key concepts' : index === 1 ? 'In-depth tutorials' : 'Industry updates'}</span>
              </li>
                        <li className="flex items-baseline gap-2">
                          <span className={`${index === 0 ? 'text-blue-500' : index === 1 ? 'text-purple-500' : 'text-orange-500'} text-sm`}>•</span>
                          <span className="text-sm">{index === 0 ? 'Beginner-friendly tutorials' : index === 1 ? 'Case studies' : 'New developments'}</span>
              </li>
                        <li className="flex items-baseline gap-2">
                          <span className={`${index === 0 ? 'text-blue-500' : index === 1 ? 'text-purple-500' : 'text-orange-500'} text-sm`}>•</span>
                          <span className="text-sm">{index === 0 ? 'Common questions answered' : index === 1 ? 'Expert interviews' : 'Future predictions'}</span>
              </li>
                      </>
                    )}
            </ul>
                </div>
              ))}
              
              {/* Fallback if no content pillars are defined */}
              {(!userStrategy.contentStrategy?.pillars || userStrategy.contentStrategy.pillars.length === 0) && (
                <>
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2">Pillar 1: {userStrategy.mainTopic} Basics</h4>
                    <p className="text-sm text-gray-600 mb-3">Foundational content to educate your audience about the basics of {userStrategy.mainTopic}</p>
                    <ul className="space-y-2">
                      <li className="flex items-baseline gap-2">
                        <span className="text-blue-500 text-sm">•</span>
                        <span className="text-sm">Introduction to key concepts</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-blue-500 text-sm">•</span>
                        <span className="text-sm">Beginner-friendly tutorials</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-blue-500 text-sm">•</span>
                        <span className="text-sm">Common questions answered</span>
                      </li>
                </ul>
              </div>

                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h4 className="font-medium mb-2">Pillar 2: Advanced {userStrategy.mainTopic}</h4>
                    <p className="text-sm text-gray-600 mb-3">Deeper content for those already familiar with {userStrategy.mainTopic}</p>
                    <ul className="space-y-2">
                      <li className="flex items-baseline gap-2">
                        <span className="text-purple-500 text-sm">•</span>
                        <span className="text-sm">In-depth tutorials</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-purple-500 text-sm">•</span>
                        <span className="text-sm">Case studies</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-purple-500 text-sm">•</span>
                        <span className="text-sm">Expert interviews</span>
                      </li>
                </ul>
              </div>

                  <div className="p-4 border rounded-lg bg-orange-50">
                    <h4 className="font-medium mb-2">Pillar 3: {userStrategy.mainTopic} Trends</h4>
                    <p className="text-sm text-gray-600 mb-3">Stay current with the latest developments in {userStrategy.mainTopic}</p>
                    <ul className="space-y-2">
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500 text-sm">•</span>
                        <span className="text-sm">Industry updates</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500 text-sm">•</span>
                        <span className="text-sm">New developments</span>
                      </li>
                      <li className="flex items-baseline gap-2">
                        <span className="text-orange-500 text-sm">•</span>
                        <span className="text-sm">Future predictions</span>
                      </li>
                </ul>
              </div>
                </>
              )}
            </div>

            <h3 className="font-medium mb-3">Content Mix & Tone</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Content Distribution</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Educational (40%)</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <p className="text-sm font-medium">Entertaining (30%)</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded">
                    <p className="text-sm font-medium">Inspirational (20%)</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-sm font-medium">Promotional (10%)</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Tone and Style</h4>
                <p className="text-sm">{userStrategy.contentStrategy?.toneAndStyle || 'Professional yet approachable, using clear language to explain complex concepts about your topic.'}</p>
              </div>
            </div>

            <h3 className="font-medium mb-3">Recommended Content Ideas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(userStrategy.recommendations?.contentIdeas && userStrategy.recommendations.contentIdeas.length > 0 
                ? userStrategy.recommendations.contentIdeas 
                : contentIdeas).map((idea: string, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-baseline gap-2">
                    <span className="text-orange-500">•</span>
                    <p>{idea}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audience" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Target Audience Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
                      {userStrategy.targetAudience.interests.map((interest: string) => (
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
                        {userStrategy.targetAudience.customInterests?.map((interest: string) => (
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
            
            <h3 className="font-medium mb-4">Audience Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Audience Profile 1 */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2">Profile 1: Beginners</h4>
                <p className="text-sm text-gray-600 mb-3">New to {userStrategy.mainTopic} and looking for guidance</p>
                <ul className="space-y-2">
                  <li className="flex items-baseline gap-2">
                    <span className="text-blue-500 text-sm">•</span>
                    <span className="text-sm">New to the topic</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-blue-500 text-sm">•</span>
                    <span className="text-sm">Looking for clear, simple explanations</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-blue-500 text-sm">•</span>
                    <span className="text-sm">Need step-by-step guidance</span>
                  </li>
                </ul>
              </div>
              
              {/* Audience Profile 2 */}
              <div className="p-4 border rounded-lg bg-purple-50">
                <h4 className="font-medium mb-2">Profile 2: Intermediate Enthusiasts</h4>
                <p className="text-sm text-gray-600 mb-3">Have some experience with {userStrategy.mainTopic}</p>
                <ul className="space-y-2">
                  <li className="flex items-baseline gap-2">
                    <span className="text-purple-500 text-sm">•</span>
                    <span className="text-sm">Some experience with the topic</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-purple-500 text-sm">•</span>
                    <span className="text-sm">Looking to improve their skills</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-purple-500 text-sm">•</span>
                    <span className="text-sm">Interested in best practices</span>
                  </li>
                </ul>
              </div>
              
              {/* Audience Profile 3 */}
              <div className="p-4 border rounded-lg bg-orange-50">
                <h4 className="font-medium mb-2">Profile 3: Industry Professionals</h4>
                <p className="text-sm text-gray-600 mb-3">Experienced in {userStrategy.mainTopic} field</p>
                <ul className="space-y-2">
                  <li className="flex items-baseline gap-2">
                    <span className="text-orange-500 text-sm">•</span>
                    <span className="text-sm">Experienced in the field</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-orange-500 text-sm">•</span>
                    <span className="text-sm">Looking for advanced insights</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-orange-500 text-sm">•</span>
                    <span className="text-sm">Want to stay updated on trends</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Platform Strategy</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-3">Current Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userStrategy.currentChannels.map((platform: string) => (
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

          <TabsContent value="recommendations" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Platform Recommendations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Primary Platforms */}
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Primary Platforms
                </h3>
                <div className="space-y-4">
                  {userStrategy.currentChannels.slice(0, 2).map((channel: string, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium mb-2">{channel}</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span>Post {channel === 'Instagram' ? '3-4' : '2-3'} times per week</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span>Focus on {channel === 'Instagram' ? 'visual content with educational carousels' : 'short-form video content'}</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span>Engage with followers daily through {channel === 'Instagram' ? 'stories and comments' : 'comments and community posts'}</span>
                        </li>
                      </ul>
                      </div>
                  ))}
                </div>
              </div>
              
              {/* Secondary Platforms */}
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <h3 className="font-medium text-purple-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 00-2 0v1a1 1 0 002 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Secondary Platforms
                </h3>
                <div className="space-y-4">
                  {userStrategy.currentChannels.slice(2).map((channel: string, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium mb-2">{channel || "LinkedIn"}</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-purple-600 font-bold mt-1">•</span>
                          <span>Post 1-2 times per week</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-purple-600 font-bold mt-1">•</span>
                          <span>Repurpose content from primary platforms with platform-specific adjustments</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-purple-600 font-bold mt-1">•</span>
                          <span>Focus on professional networking and industry insights</span>
                        </li>
                      </ul>
                    </div>
                  ))}
                  {userStrategy.currentChannels.length <= 2 && (
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium mb-2">LinkedIn</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-purple-600 font-bold mt-1">•</span>
                          <span>Consider adding as a secondary platform</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-purple-600 font-bold mt-1">•</span>
                          <span>Great for professional networking in {userStrategy.mainTopic}</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-purple-600 font-bold mt-1">•</span>
                          <span>Post 1-2 times per week with industry insights</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                </div>
              </div>

            {/* Content Types */}
            <div className="bg-green-50 p-5 rounded-lg border border-green-100 mb-8">
              <h3 className="font-medium text-green-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Recommended Content Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Educational
                  </h4>
                  <p className="text-sm">How-to guides, tutorials, and explainers about {userStrategy.mainTopic}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-yellow-100 text-yellow-800 p-1 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Q&A
                  </h4>
                  <p className="text-sm">Answering common questions about {userStrategy.mainTopic}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-red-100 text-red-800 p-1 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </span>
                    Behind-the-Scenes
                  </h4>
                  <p className="text-sm">Day-in-the-life content showing your {userStrategy.mainTopic} process</p>
                </div>
              </div>
            </div>
            
            {/* Posting Schedule */}
            <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
              <h3 className="font-medium text-orange-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Optimal Posting Schedule
              </h3>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                    <h4 className="font-medium mb-3">Best Days</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Monday</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Wednesday</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Friday</span>
                  </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Best Times</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">8-10 AM</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">12-1 PM</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">7-9 PM</span>
                  </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-3">Posting Frequency</h4>
                  <p className="text-sm">For optimal engagement, post 3-4 times per week on primary platforms and 1-2 times per week on secondary platforms.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Weekly Content Plan</h2>
            
            <div className="space-y-8">
              {/* Week 1 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3">
                  <h3 className="font-medium">Week 1: Getting Started</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Monday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Monday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mb-1">Post</span>
                          <p>Introduction to {userStrategy.mainTopic} - key concepts explained</p>
                        </div>
                </div>
              </div>

                    {/* Wednesday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Wednesday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mb-1">Story</span>
                          <p>Behind-the-scenes look at your {userStrategy.mainTopic} process</p>
                    </div>
                      </div>
                    </div>
                    
                    {/* Friday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Friday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full mb-1">Carousel</span>
                          <p>5 tips for beginners in {userStrategy.mainTopic}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Week 2 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-indigo-600 text-white px-4 py-3">
                  <h3 className="font-medium">Week 2: Building Knowledge</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Monday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Monday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mb-1">Tutorial</span>
                          <p>Step-by-step guide on {userStrategy.subTopic || "a related subtopic"}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wednesday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Wednesday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full mb-1">Q&A</span>
                          <p>Answering common questions about {userStrategy.mainTopic}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Friday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Friday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mb-1">Post</span>
                          <p>Spotlight on a successful case study in {userStrategy.mainTopic}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Week 3 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-purple-600 text-white px-4 py-3">
                  <h3 className="font-medium">Week 3: Advanced Concepts</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Monday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Monday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full mb-1">Carousel</span>
                          <p>Advanced techniques in {userStrategy.mainTopic}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wednesday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Wednesday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mb-1">Story</span>
                          <p>Day in the life of a {userStrategy.mainTopic} professional</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Friday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Friday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full mb-1">Live</span>
                          <p>Expert interview on the future of {userStrategy.mainTopic}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Week 4 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-3">
                  <h3 className="font-medium">Week 4: Community Engagement</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Monday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Monday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mb-1">Post</span>
                          <p>Community spotlight: featuring followers' {userStrategy.mainTopic} work</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wednesday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Wednesday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full mb-1">Poll</span>
                          <p>What {userStrategy.mainTopic} topic should we cover next?</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Friday */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Friday</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border text-sm">
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mb-1">Tutorial</span>
                          <p>Collaborative project in {userStrategy.mainTopic}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Goals & Challenges</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Goals Section */}
              <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                <h3 className="font-medium text-green-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Content Goals
                </h3>
                <ul className="space-y-3">
                  {Array.isArray(userStrategy.goal) ? userStrategy.goal.map((goal: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span>{goal}</span>
                      </li>
                  )) : (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span>{userStrategy.goal}</span>
                      </li>
                  )}
                    </ul>
                  </div>
              
              {/* Challenges Section */}
              <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                <h3 className="font-medium text-red-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Challenges to Overcome
                </h3>
                <ul className="space-y-3">
                  {Array.isArray(userStrategy.challenges) ? userStrategy.challenges.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span>{challenge}</span>
                      </li>
                  )) : (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span>{userStrategy.challenges || "No specific challenges identified"}</span>
                      </li>
                  )}
                    </ul>
              </div>
            </div>
            
            {/* Key Performance Indicators */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-8">
              <h3 className="font-medium text-blue-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                </svg>
                Key Performance Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600">Engagement</h4>
                  <p className="mt-1 text-sm">Likes, comments, shares, and saves per post</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600">Growth</h4>
                  <p className="mt-1 text-sm">Follower growth rate and reach expansion</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600">Conversion</h4>
                  <p className="mt-1 text-sm">Click-through rates and conversion actions</p>
                  </div>
                </div>
              </div>

            {/* Timeline */}
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 012 0v10a1 1 0 11-2 0V2zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
                </svg>
                Implementation Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-200 text-purple-800 font-medium px-3 py-1 rounded-full text-sm mr-3 w-24 text-center">
                    Month 1
                  </div>
              <div>
                    <p className="text-sm">Establish baseline content and begin implementing strategy</p>
                  </div>
                  </div>
                <div className="flex items-start">
                  <div className="bg-purple-200 text-purple-800 font-medium px-3 py-1 rounded-full text-sm mr-3 w-24 text-center">
                    Month 2-3
                  </div>
                  <div>
                    <p className="text-sm">Analyze performance and refine approach based on audience response</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-200 text-purple-800 font-medium px-3 py-1 rounded-full text-sm mr-3 w-24 text-center">
                    Month 4-6
                  </div>
                  <div>
                    <p className="text-sm">Scale successful content types and explore new formats</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

