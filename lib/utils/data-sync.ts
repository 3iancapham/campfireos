import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { SurveyAnswers, UserData } from '../types'

/**
 * Synchronizes user data between Firestore and localStorage
 * This helps users who switch between devices to maintain their data
 */
export async function syncUserDataToLocalStorage(userId: string): Promise<boolean> {
  try {
    console.log("Starting syncUserDataToLocalStorage for user:", userId);
    
    // Check if onboardingSurvey exists in localStorage
    const hasLocalSurvey = localStorage.getItem("onboardingSurvey")
    console.log("Has local survey:", !!hasLocalSurvey);
    
    if (!hasLocalSurvey) {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId))
      console.log("Firestore user document exists:", userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log("User data from Firestore:", userData);
        
        // If user has surveyAnswers in Firestore, sync to localStorage
        if (userData.surveyAnswers) {
          console.log("Found surveyAnswers in Firestore, syncing to localStorage");
          localStorage.setItem("onboardingSurvey", JSON.stringify(userData.surveyAnswers))
          console.log("Synced survey data from Firestore to localStorage")
          return true
        }
        
        // If user has strategy but no surveyAnswers, create minimal survey data
        else if (userData.strategy) {
          console.log("Found strategy but no surveyAnswers, creating minimal survey");
          const minimalSurvey: SurveyAnswers = createMinimalSurveyFromStrategy(userData)
          localStorage.setItem("onboardingSurvey", JSON.stringify(minimalSurvey))
          console.log("Created onboardingSurvey from existing strategy data")
          return true
        }
      }
    }
    
    console.log("No data to sync or sync not needed");
    return false
  } catch (error) {
    console.error("Error syncing user data:", error)
    return false
  }
}

/**
 * Creates a minimal survey object from strategy data
 */
export function createMinimalSurveyFromStrategy(userData: UserData): SurveyAnswers {
  const strategy = userData.strategy
  
  if (!strategy) {
    throw new Error("Cannot create survey from undefined strategy")
  }
  
  return {
    businessType: strategy.mainTopic || "Not specified",
    experience: "creator",
    goals: [strategy.goal || "awareness"],
    targetAudienceDetails: {
      demographics: strategy.targetAudience?.ageGroups || [],
      interests: [
        ...(strategy.targetAudience?.interests || []),
        ...(strategy.targetAudience?.customInterests || [])
      ],
      behaviors: [],
      painPoints: strategy.challenges || []
    },
    contentPreferences: {
      preferredFormats: [],
      topicAreas: [strategy.mainTopic, strategy.subTopic].filter(Boolean),
      tone: "not specified",
      postingFrequency: "not specified"
    },
    resources: {
      timeAvailable: "not specified",
      budget: "not specified",
      team: []
    },
    challenges: strategy.challenges || [],
    existingPresence: {
      platforms: strategy.currentChannels || [],
      followers: { total: 0 },
      engagement: {}
    },
    competitorInsights: {
      mainCompetitors: [],
      successfulStrategies: [],
      gaps: []
    },
    surveyCompletedAt: strategy.generatedAt || new Date().toISOString()
  }
}

/**
 * Synchronizes localStorage data to Firestore
 * Useful when a user completes onboarding on a new device
 */
export async function syncLocalStorageToFirestore(userId: string): Promise<boolean> {
  try {
    const onboardingSurvey = localStorage.getItem("onboardingSurvey")
    
    if (onboardingSurvey) {
      // This would be implemented in the useUserData hook
      // We're just returning true here to indicate it should be done
      return true
    }
    
    return false
  } catch (error) {
    console.error("Error syncing localStorage to Firestore:", error)
    return false
  }
} 