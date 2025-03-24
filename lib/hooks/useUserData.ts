import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserData, UserStrategy, ContentPlan, SurveyAnswers } from '../types'
import { syncUserDataToLocalStorage } from '../utils/data-sync'

export function useUserData() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserData() {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data() as UserData
          setUserData(userDataFromFirestore)
          
          // Sync data to localStorage if needed
          await syncUserDataToLocalStorage(user.uid)
        } else {
          // Initialize user document if it doesn't exist
          const initialData: UserData = {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            strategy: null,
            contentPlan: null,
            surveyAnswers: null
          }
          await setDoc(doc(db, 'users', user.uid), initialData)
          setUserData(initialData)
        }
        setError(null)
      } catch (err) {
        setError('Failed to load user data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const updateStrategy = async (strategy: UserStrategy) => {
    if (!user?.uid) {
      console.error('Cannot update strategy: No user ID');
      return false;
    }

    // Validate strategy object
    if (!strategy) {
      console.error('Cannot update strategy: Strategy is null');
      return false;
    }

    // Log the strategy being saved
    console.log('Attempting to save strategy to Firestore:', JSON.stringify(strategy, null, 2));

    // Validate required fields
    const requiredFields = ['mainTopic', 'subTopic', 'currentChannels', 'targetAudience', 'goal', 'challenges', 'contentStrategy'];
    const missingFields = requiredFields.filter(field => !strategy[field]);
    
    if (missingFields.length > 0) {
      console.error('Strategy is missing required fields:', missingFields);
      return false;
    }

    try {
      const strategyToSave = {
        ...strategy,
        generatedAt: new Date().toISOString()
      };

      // Log the final object being saved
      console.log('Saving strategy to Firestore:', JSON.stringify(strategyToSave, null, 2));

      await updateDoc(doc(db, 'users', user.uid), {
        strategy: strategyToSave,
        updatedAt: new Date().toISOString()
      });
      
      if (userData) {
        const updatedUserData = {
          ...userData,
          strategy: strategyToSave,
          updatedAt: new Date().toISOString()
        };
        
        // Log the updated user data
        console.log('Updating local user data:', JSON.stringify(updatedUserData, null, 2));
        
        setUserData(updatedUserData);
      }

      console.log('Strategy successfully saved to Firestore');
      return true;
    } catch (err) {
      console.error('Error updating strategy:', err);
      // Log the full error details
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
      }
      return false;
    }
  }

  const updateContentPlan = async (contentPlan: ContentPlan) => {
    if (!user?.uid) return false

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        contentPlan: {
          ...contentPlan,
          generatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      })
      
      if (userData) {
        setUserData({
          ...userData,
          contentPlan,
          updatedAt: new Date().toISOString()
        })
      }
      return true
    } catch (err) {
      console.error('Error updating content plan:', err)
      return false
    }
  }

  const updateUser = async (data: Partial<UserData>) => {
    if (!user?.uid) return false

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: new Date().toISOString()
      })
      
      if (userData) {
        setUserData({
          ...userData,
          ...data,
          updatedAt: new Date().toISOString()
        })
      }
      return true
    } catch (err) {
      console.error('Error updating user:', err)
      return false
    }
  }

  const updateSurveyAnswers = async (answers: SurveyAnswers) => {
    if (!user?.uid) return false

    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        surveyAnswers: {
          ...answers,
          surveyCompletedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      })
      
      // Also update localStorage
      localStorage.setItem("onboardingSurvey", JSON.stringify(answers))
      
      if (userData) {
        setUserData({
          ...userData,
          surveyAnswers: answers,
          updatedAt: new Date().toISOString()
        })
      }
      return true
    } catch (err) {
      console.error('Error updating survey answers:', err)
      return false
    }
  }

  return {
    userData,
    loading,
    error,
    updateStrategy,
    updateContentPlan,
    updateUser,
    updateSurveyAnswers
  }
} 