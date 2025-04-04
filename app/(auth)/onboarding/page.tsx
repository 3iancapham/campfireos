"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Check, ArrowRight, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserData } from "@/lib/hooks/useUserData"
import type { SurveyAnswers } from "@/lib/types"

// Define the types for our form data
type OnboardingData = {
  creatorType: "small_business" | "creator" | "enterprise" | "other"
  followerSize: "0-1k" | "1k-10k" | "10k-50k" | "50k-100k" | "100k-500k" | "500k-1m" | "1m+"
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
  goal: "product" | "service" | "awareness" | "community" | "other"
  goalDetails: string
  challenges: string[]
}

// Social media platforms
const socialPlatforms = [
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube" },
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "pinterest", name: "Pinterest" },
  { id: "reddit", name: "Reddit" },
  { id: "twitch", name: "Twitch" },
]

// Common interests for target audience
const commonInterests = [
  { id: "technology", name: "Technology" },
  { id: "fashion", name: "Fashion" },
  { id: "beauty", name: "Beauty" },
  { id: "fitness", name: "Fitness" },
  { id: "health", name: "Health & Wellness" },
  { id: "food", name: "Food & Cooking" },
  { id: "travel", name: "Travel" },
  { id: "business", name: "Business" },
  { id: "finance", name: "Finance" },
  { id: "education", name: "Education" },
  { id: "entertainment", name: "Entertainment" },
  { id: "gaming", name: "Gaming" },
  { id: "art", name: "Art & Design" },
  { id: "music", name: "Music" },
  { id: "diy", name: "DIY & Crafts" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { updateSurveyAnswers } = useUserData()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OnboardingData>({
    creatorType: "creator",
    followerSize: "0-1k",
    mainTopic: "",
    subTopic: "",
    currentChannels: [],
    targetAudience: {
      ageGroups: [],
      gender: "all",
      interests: [],
      location: "global",
      customInterests: [],
    },
    goal: "awareness",
    goalDetails: "",
    challenges: [],
  })

  // Custom challenge options with ability to add custom challenges
  const [challenges, setChallenges] = useState([
    { id: "time", text: "Not enough time to create content", selected: false },
    { id: "ideas", text: "Running out of content ideas", selected: false },
    { id: "engagement", text: "Low engagement on posts", selected: false },
    { id: "growth", text: "Slow follower growth", selected: false },
    { id: "consistency", text: "Inconsistent posting schedule", selected: false },
    { id: "strategy", text: "Lack of clear strategy", selected: false },
    { id: "analytics", text: "Difficulty understanding analytics", selected: false },
  ])
  const [customChallenge, setCustomChallenge] = useState("")
  const [customInterest, setCustomInterest] = useState("")

  const handleChallengeToggle = (id: string) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === id ? { ...challenge, selected: !challenge.selected } : challenge,
      ),
    )
  }

  const addCustomChallenge = () => {
    if (customChallenge.trim()) {
      const newId = `custom-${challenges.length}`
      setChallenges([...challenges, { id: newId, text: customChallenge, selected: true }])
      setCustomChallenge("")
    }
  }

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.targetAudience.customInterests.includes(customInterest)) {
      setFormData({
        ...formData,
        targetAudience: {
          ...formData.targetAudience,
          customInterests: [...formData.targetAudience.customInterests, customInterest],
        },
      })
      setCustomInterest("")
    }
  }

  const handleChannelToggle = (channelId: string) => {
    if (formData.currentChannels.includes(channelId)) {
      setFormData({
        ...formData,
        currentChannels: formData.currentChannels.filter((id) => id !== channelId),
      })
    } else {
      setFormData({
        ...formData,
        currentChannels: [...formData.currentChannels, channelId],
      })
    }
  }

  const handleInterestToggle = (interestId: string) => {
    if (formData.targetAudience.interests.includes(interestId)) {
      setFormData({
        ...formData,
        targetAudience: {
          ...formData.targetAudience,
          interests: formData.targetAudience.interests.filter((id) => id !== interestId),
        },
      })
    } else {
      setFormData({
        ...formData,
        targetAudience: {
          ...formData.targetAudience,
          interests: [...formData.targetAudience.interests, interestId],
        },
      })
    }
  }

  const handleAgeGroupToggle = (ageGroup: string) => {
    if (formData.targetAudience.ageGroups.includes(ageGroup)) {
      setFormData({
        ...formData,
        targetAudience: {
          ...formData.targetAudience,
          ageGroups: formData.targetAudience.ageGroups.filter((group) => group !== ageGroup),
        },
      })
    } else {
      setFormData({
        ...formData,
        targetAudience: {
          ...formData.targetAudience,
          ageGroups: [...formData.targetAudience.ageGroups, ageGroup],
        },
      })
    }
  }

  const validateStep = (currentStep: number): boolean => {
    setError(null)
    
    switch (currentStep) {
      case 1: // Profile
        if (!formData.creatorType) {
          setError("Please select your creator type")
          return false
        }
        if (!formData.followerSize) {
          setError("Please select your follower size")
          return false
        }
        return true

      case 2: // Niche
        if (!formData.mainTopic.trim()) {
          setError("Please enter your main topic")
          return false
        }
        if (!formData.subTopic.trim()) {
          setError("Please enter your subtopic")
          return false
        }
        return true

      case 3: // Channels
        if (formData.currentChannels.length === 0) {
          setError("Please select at least one platform")
          return false
        }
        return true

      case 4: // Audience
        if (formData.targetAudience.ageGroups.length === 0) {
          setError("Please select at least one age group")
          return false
        }
        if (!formData.targetAudience.gender) {
          setError("Please select a gender focus")
          return false
        }
        if (!formData.targetAudience.location) {
          setError("Please select a location")
          return false
        }
        if (formData.targetAudience.interests.length === 0 && formData.targetAudience.customInterests.length === 0) {
          setError("Please select or add at least one interest")
          return false
        }
        return true

      case 5: // Goals
        if (!formData.goal) {
          setError("Please select your primary goal")
          return false
        }
        if (!formData.goalDetails.trim()) {
          setError("Please provide details about your goal")
          return false
        }
        if (!challenges.some(c => c.selected)) {
          setError("Please select at least one challenge")
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateStep(step)) {
      return
    }

    if (step === 5) {
      // Update challenges in formData
      const selectedChallenges = challenges.filter((c) => c.selected).map((c) => c.text)
      setFormData({ ...formData, challenges: selectedChallenges })
    }

    if (step < 5) {
      setStep(step + 1)
      // Scroll to top of content area
      const contentArea = document.querySelector('.overflow-y-auto')
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      // Final step - generate strategy
      setIsGenerating(true)

      // Prepare survey data
      const getFollowerCount = (range: string): number => {
        switch (range) {
          case "0-1k": return 1000
          case "1k-10k": return 10000
          case "10k-50k": return 50000
          case "50k-100k": return 100000
          case "100k-500k": return 500000
          case "500k-1m": return 1000000
          case "1m+": return 1000000
          default: return 0
        }
      }

      // Core survey data that matches SurveyAnswers interface
      const surveyData: SurveyAnswers = {
        businessType: formData.mainTopic,
        mainTopic: formData.mainTopic,
        subTopic: formData.subTopic,
        goals: [formData.goal, ...formData.challenges],
        targetAudience: {
          ageGroups: formData.targetAudience.ageGroups,
          gender: formData.targetAudience.gender,
          interests: formData.targetAudience.interests,
          location: formData.targetAudience.location,
          customInterests: formData.targetAudience.customInterests
        },
        platforms: formData.currentChannels,
        challenges: formData.challenges,
        surveyCompletedAt: new Date().toISOString()
      }

      // Extended data for strategy generation
      const strategyData = {
        ...surveyData,
        experience: formData.creatorType,
        targetAudienceDetails: {
          demographics: [...formData.targetAudience.ageGroups, formData.targetAudience.gender],
          interests: [...formData.targetAudience.interests, ...formData.targetAudience.customInterests],
          behaviors: [],
          painPoints: formData.challenges
        },
        contentPreferences: {
          preferredFormats: [],
          topicAreas: [formData.mainTopic, formData.subTopic],
          tone: "not specified",
          postingFrequency: "not specified"
        },
        resources: {
          timeAvailable: "not specified",
          budget: "not specified",
          team: []
        },
        existingPresence: {
          platforms: formData.currentChannels,
          followers: { total: getFollowerCount(formData.followerSize) },
          engagement: {}
        },
        competitorInsights: {
          mainCompetitors: [],
          successfulStrategies: [],
          gaps: []
        }
      }

      try {
        // Store core survey data in both localStorage and Firestore
        localStorage.setItem("onboardingSurvey", JSON.stringify(surveyData))
        await updateSurveyAnswers(surveyData)

        // Generate strategy with extended data
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch('/api/strategy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(strategyData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Strategy generation failed with status ${response.status}`);
        }
        
        // Navigate to strategy page
        router.push("/strategy")
      } catch (error) {
        console.error("Error during onboarding completion:", error)
        setIsGenerating(false)
        alert("There was an error completing your onboarding. Please try again.")
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      // Scroll to top of content area
      const contentArea = document.querySelector('.overflow-y-auto')
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Personalizing Your Dashboard</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          We are analyzing your information and crafting a personalized social media strategy for your{" "}
          <span className="text-primary font-medium">{formData.mainTopic}</span> focus.
        </p>
        <div className="w-full max-w-md bg-muted h-3 rounded-full overflow-hidden">
          <div className="bg-primary h-full animate-pulse" style={{ width: "90%" }}></div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">This will just take just a few moments...</div>
      </div>
    )
  }

  return (
    <div className="h-screen max-h-[900px] px-4 py-4 flex flex-col">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold mb-6">Let's personalize your experience</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  stepNumber === step
                    ? "bg-primary text-primary-foreground"
                    : stepNumber < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber < step ? <Check className="h-4 w-4" /> : <span>{stepNumber}</span>}
              </div>
              <span className="text-xs hidden sm:block">
                {stepNumber === 1 && "Profile"}
                {stepNumber === 2 && "Niche"}
                {stepNumber === 3 && "Channels"}
                {stepNumber === 4 && "Audience"}
                {stepNumber === 5 && "Goals"}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main content area with step title */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-4">
        <div className="bg-primary/5 border-b p-4">
          <h2 className="text-lg font-semibold">
            {step === 1 && "Tell us about yourself"}
            {step === 2 && "What's your content focus?"}
            {step === 3 && "Which platforms are you currently using?"}
            {step === 4 && "Who is your target audience?"}
            {step === 5 && "What are your goals and challenges?"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 1 && "Help us understand your current position as a creator"}
            {step === 2 && "Tell us about the main topic and subtopic of your content"}
            {step === 3 && "Select all social media platforms where you currently post content"}
            {step === 4 && "Help us understand the demographics and interests of your ideal audience"}
            {step === 5 && "Tell us what you're trying to achieve and what obstacles you're facing"}
          </p>
          {error && (
            <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable container for content and buttons */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Content area */}
        <div className="space-y-4">
          {/* Step 1: Profile Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <Label>What type of creator are you?</Label>
                    <RadioGroup
                      value={formData.creatorType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          creatorType: value as "small_business" | "creator" | "enterprise" | "other",
                        })
                      }
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small_business" id="small_business" />
                        <Label htmlFor="small_business">Small Business</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="creator" id="creator" />
                        <Label htmlFor="creator">Creator</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enterprise" id="enterprise" />
                        <Label htmlFor="enterprise">Enterprise/Brand</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="mt-6">
                    <Label>What's your total follower size across all platforms?</Label>
                    <RadioGroup
                      value={formData.followerSize}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          followerSize: value as "0-1k" | "1k-10k" | "10k-50k" | "50k-100k" | "100k-500k" | "500k-1m" | "1m+",
                        })
                      }
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0-1k" id="0-1k" />
                        <Label htmlFor="0-1k">0-1,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1k-10k" id="1k-10k" />
                        <Label htmlFor="1k-10k">1,000-10,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10k-50k" id="10k-50k" />
                        <Label htmlFor="10k-50k">10,000-50,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="50k-100k" id="50k-100k" />
                        <Label htmlFor="50k-100k">50,000-100,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="100k-500k" id="100k-500k" />
                        <Label htmlFor="100k-500k">100,000-500,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="500k-1m" id="500k-1m" />
                        <Label htmlFor="500k-1m">500,000-1,000,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1m+" id="1m+" />
                        <Label htmlFor="1m+">1,000,000+</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Niche Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="main-topic">Main Topic</Label>
                  <Input
                    id="main-topic"
                    placeholder="e.g., Fitness, Technology, Fashion, Digital Marketing..."
                    value={formData.mainTopic}
                    onChange={(e) => setFormData({ ...formData, mainTopic: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="sub-topic">Subtopic or Specialization</Label>
                  <Input
                    id="sub-topic"
                    placeholder="e.g., Yoga for beginners, Smartphone reviews, Sustainable fashion..."
                    value={formData.subTopic}
                    onChange={(e) => setFormData({ ...formData, subTopic: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Current Channels */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socialPlatforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.currentChannels.includes(platform.id) ? "border-primary bg-primary/5" : "border-muted"
                      }`}
                      onClick={() => handleChannelToggle(platform.id)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          formData.currentChannels.includes(platform.id)
                            ? "bg-primary text-white"
                            : "border border-muted-foreground"
                        }`}
                      >
                        {formData.currentChannels.includes(platform.id) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Target Audience */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Age Groups section */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label>Age Groups (select all that apply)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {["13-17", "18-24", "25-34", "35-44", "45-54", "55+"].map((ageGroup) => (
                      <div
                        key={ageGroup}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          formData.targetAudience.ageGroups.includes(ageGroup)
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                        }`}
                        onClick={() => handleAgeGroupToggle(ageGroup)}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            formData.targetAudience.ageGroups.includes(ageGroup)
                              ? "bg-primary text-white"
                              : "border border-muted-foreground"
                          }`}
                        >
                          {formData.targetAudience.ageGroups.includes(ageGroup) && <Check className="h-2 w-2" />}
                        </div>
                        <span className="text-xs sm:text-sm whitespace-nowrap">{ageGroup}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="gender">Primary Gender Focus</Label>
                  <Select
                    value={formData.targetAudience.gender}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        targetAudience: {
                          ...formData.targetAudience,
                          gender: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genders</SelectItem>
                      <SelectItem value="female">Primarily female</SelectItem>
                      <SelectItem value="male">Primarily male</SelectItem>
                      <SelectItem value="nonbinary">Primarily non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="location">Primary Location</Label>
                  <Select
                    value={formData.targetAudience.location}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        targetAudience: {
                          ...formData.targetAudience,
                          location: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select primary location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Interests section */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label>Interests (select all that apply)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {commonInterests.map((interest) => (
                      <div
                        key={interest.id}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleInterestToggle(interest.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            formData.targetAudience.interests.includes(interest.id)
                              ? "bg-primary border-primary text-white"
                              : "border-muted-foreground"
                          }`}
                        >
                          {formData.targetAudience.interests.includes(interest.id) && <Check className="h-3 w-3" />}
                        </div>
                        <span className="text-sm">{interest.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="custom-interest">Add Custom Interest</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-interest"
                      placeholder="e.g., Sustainable living, Cryptocurrency..."
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                    />
                    <Button type="button" onClick={addCustomInterest} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.targetAudience.customInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.targetAudience.customInterests.map((interest, index) => (
                        <div
                          key={index}
                          className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {interest}
                          <button
                            type="button"
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                targetAudience: {
                                  ...formData.targetAudience,
                                  customInterests: formData.targetAudience.customInterests.filter((_, i) => i !== index),
                                },
                              })
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Goals and Challenges */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label>Primary Goal</Label>
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        goal: value as "product" | "service" | "awareness" | "community" | "other",
                      })
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="product" id="product" />
                      <Label htmlFor="product">Sell products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="service" id="service" />
                      <Label htmlFor="service">Promote services</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="awareness" id="awareness" />
                      <Label htmlFor="awareness">Build brand awareness</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="community" id="community" />
                      <Label htmlFor="community">Grow a community</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="goal-details">Tell us more about your goal</Label>
                  <Textarea
                    id="goal-details"
                    placeholder="Provide more details about what you want to achieve..."
                    value={formData.goalDetails}
                    onChange={(e) => setFormData({ ...formData, goalDetails: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label>Current Challenges</Label>
                  <div className="space-y-3">
                    {challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          challenge.selected ? "border-primary bg-primary/5" : "border-muted"
                        }`}
                        onClick={() => handleChallengeToggle(challenge.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            challenge.selected ? "bg-primary text-white" : "border border-muted-foreground"
                          }`}
                        >
                          {challenge.selected && <Check className="h-3 w-3" />}
                        </div>
                        <span>{challenge.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="custom-challenge">Add Another Challenge</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-challenge"
                      placeholder="Describe your challenge..."
                      value={customChallenge}
                      onChange={(e) => setCustomChallenge(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomChallenge()}
                    />
                    <Button type="button" onClick={addCustomChallenge} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons - now part of the scrollable content */}
          <div className="flex gap-2 mt-4 px-4">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={step === 1} 
              className="flex-1 border-gray-500 hover:bg-gray-100"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              className="flex-1"
            >
              {step < 5 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Generate Strategy"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

