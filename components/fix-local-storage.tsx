"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth'
import { syncUserDataToLocalStorage } from '@/lib/utils/data-sync'
import { useRouter } from 'next/navigation'
import { getDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function FixLocalStorageButton() {
  const { user } = useAuth()
  const [isFixing, setIsFixing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleFix = async () => {
    if (!user) {
      setMessage("You need to be logged in to fix your data.")
      return
    }

    setIsFixing(true)
    setMessage("Fixing your data...")

    try {
      console.log("Starting data fix process...");
      console.log("User ID:", user.uid);
      
      const localSurvey = localStorage.getItem("onboardingSurvey");
      console.log("Local Storage Survey:", localSurvey);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log("Firestore User Data:", userDoc.data());
      
      // Try to regenerate strategy if it's missing
      if (!userDoc.data()?.strategy && localSurvey) {
        console.log("No strategy found in Firestore, regenerating from survey data...");
        setMessage("Regenerating your strategy...");
        
        const surveyData = JSON.parse(localSurvey);
        console.log("Parsed survey data:", surveyData);
        
        try {
          // Call the strategy API
          console.log("Calling strategy API...");
          const response = await fetch('/api/strategy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData),
          });
          
          console.log("API Response status:", response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error response:", errorText);
            throw new Error(`Strategy generation failed with status ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          console.log("Generated strategy:", data);
          
          if (!data.strategy) {
            throw new Error("No strategy received from API");
          }
          
          // Save the strategy to Firestore
          console.log("Saving strategy to Firestore...");
          await updateDoc(doc(db, 'users', user.uid), {
            strategy: data.strategy,
            updatedAt: new Date().toISOString()
          });
          
          console.log("Strategy saved successfully");
          setMessage("Success! Your strategy has been regenerated. Redirecting...");
          setTimeout(() => {
            router.push('/strategy');
          }, 2000);
          return;
        } catch (apiError) {
          console.error("Error during strategy generation:", apiError);
          setMessage(`Error generating strategy: ${apiError.message}`);
          return;
        }
      }
      
      const result = await syncUserDataToLocalStorage(user.uid)
      
      if (result) {
        setMessage("Success! Your data has been fixed. Redirecting...")
        setTimeout(() => {
          router.push('/strategy')
        }, 2000)
      } else {
        setMessage("No data to fix or unable to fix. Please contact support if the issue persists.")
      }
    } catch (error) {
      console.error("Error fixing data:", error)
      setMessage("An error occurred. Please try again or contact support.")
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={handleFix} 
        disabled={isFixing}
        className="w-full max-w-xs"
      >
        {isFixing ? "Fixing..." : "Fix My Data"}
      </Button>
      
      {message && (
        <p className="text-sm text-center text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
} 