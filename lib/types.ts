export interface UserData {
  firstName: string
  lastName: string
  email: string
  photoURL: string
  createdAt: string
  lastLogin: string
  updatedAt: string
  strategy: UserStrategy | null
  contentPlan: ContentPlan | null
  surveyAnswers: SurveyAnswers | null
}

export interface UserStrategy {
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

export interface ContentPlan {
  weeks: ContentWeek[]
  themes: ContentTheme[]
  generatedAt: string
}

export interface ContentWeek {
  weekNumber: number
  posts: ContentPost[]
}

export interface ContentPost {
  id: string
  platform: string
  contentType: "image" | "video" | "text" | "carousel" | "story"
  topic: string
  description: string
  suggestedDate: string
  suggestedTime: string
  status: "draft" | "scheduled" | "published"
}

export interface ContentTheme {
  id: string
  name: string
  description: string
  color: string
}

export type Post = {
  id: string
  userId: string
  platform: string
  contentType: "image" | "video" | "text" | "carousel" | "story"
  topic: string
  description: string
  suggestedDate: string
  suggestedTime: string
  status: "draft" | "scheduled" | "published"
  weekNumber: number
  publishedAt?: string
  analytics?: {
    views: number
    likes: number
    comments: number
  }
}

export interface SurveyAnswers {
  businessType: string
  experience: string
  goals: string[]
  targetAudienceDetails: {
    demographics: string[]
    interests: string[]
    behaviors: string[]
    painPoints: string[]
  }
  contentPreferences: {
    preferredFormats: string[]
    topicAreas: string[]
    tone: string
    postingFrequency: string
  }
  resources: {
    timeAvailable: string
    budget: string
    team: string[]
  }
  challenges: string[]
  existingPresence: {
    platforms: string[]
    followers: Record<string, number>
    engagement: Record<string, number>
  }
  competitorInsights: {
    mainCompetitors: string[]
    successfulStrategies: string[]
    gaps: string[]
  }
  surveyCompletedAt: string
} 