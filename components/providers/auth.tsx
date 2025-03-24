'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      // If user is logged in, check and sync their data with localStorage
      if (user) {
        try {
          // Check if onboardingSurvey exists in localStorage
          const hasLocalSurvey = localStorage.getItem("onboardingSurvey")
          
          if (!hasLocalSurvey) {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            
            if (userDoc.exists()) {
              const userData = userDoc.data()
              
              // If user has surveyAnswers in Firestore but not in localStorage, sync it
              if (userData.surveyAnswers) {
                localStorage.setItem("onboardingSurvey", JSON.stringify(userData.surveyAnswers))
                console.log("Synced survey data from Firestore to localStorage")
              }
            }
          }
        } catch (error) {
          console.error("Error syncing user data:", error)
        }
      }
      
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 