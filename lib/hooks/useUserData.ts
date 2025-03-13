import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserData, UserStrategy, ContentPlan, SurveyAnswers } from '../types'

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
          setUserData(userDoc.data() as UserData)
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
    if (!user?.uid) return false

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        strategy: {
          ...strategy,
          generatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      })
      
      if (userData) {
        setUserData({
          ...userData,
          strategy,
          updatedAt: new Date().toISOString()
        })
      }
      return true
    } catch (err) {
      console.error('Error updating strategy:', err)
      return false
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
      await updateDoc(doc(db, 'users', user.uid), {
        surveyAnswers: {
          ...answers,
          surveyCompletedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      })
      
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