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
  challenges: string[]
  generatedAt: string
  contentStrategy: {
    pillars: Array<{
      name: string
      description: string
      themes: string[]
    }>
    toneAndStyle: string
  }
  recommendations: {
    contentIdeas: string[]
    postingSchedule: {
      frequency: string
      bestTimes: string[]
      platforms: Record<string, string>
    }
    strategic: string[]
  }
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
  mainTopic: string
  subTopic: string
  goals: string[]
  targetAudience: {
    ageGroups: string[]
    gender: string
    interests: string[]
    location: string
    customInterests: string[]
  }
  platforms: string[]
  challenges: string[]
  surveyCompletedAt: string
} 