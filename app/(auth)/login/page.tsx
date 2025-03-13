"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleButton } from "@/components/ui/google-button"
import { useToast } from "@/components/ui/use-toast"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('Login page: Email login successful', result.user.uid)
      
      // Update last login time in Firestore
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)
      await setDoc(userDocRef, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      })

      // Check if user has completed onboarding
      const onboardingSurvey = localStorage.getItem("onboardingSurvey")
      if (!onboardingSurvey) {
        router.push("/onboarding")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('Login page: Starting Google sign-in')
      const provider = new GoogleAuthProvider()
      console.log('Login page: Created Google provider')
      
      const result = await signInWithPopup(auth, provider)
      console.log('Login page: Sign-in successful', result.user.uid)
      
      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        // User exists, update last login time
        console.log('Login page: User exists in Firestore, updating lastLogin')
        await setDoc(userDocRef, {
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true })

        // Check if user has completed onboarding
        const onboardingSurvey = localStorage.getItem("onboardingSurvey")
        if (!onboardingSurvey) {
          router.push("/onboarding")
          return
        }
      } else {
        // New user, create document and redirect to onboarding
        console.log('Login page: User does not exist in Firestore, creating new document')
        await setDoc(userDocRef, {
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        router.push("/onboarding")
        return
      }
      
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error('Login page: Google sign-in error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <GoogleButton onClick={handleGoogleSignIn} />
      </div>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}

