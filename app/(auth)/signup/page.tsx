"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleButton } from "@/components/ui/google-button"
import { useToast } from "@/components/ui/use-toast"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create the user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Store additional user data in Firestore
      const userDoc = doc(db, 'users', user.uid)
      await setDoc(userDoc, {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      })
      router.push("/onboarding")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('Signup page: Starting Google sign-in')
      const provider = new GoogleAuthProvider()
      console.log('Signup page: Created Google provider')
      
      const result = await signInWithPopup(auth, provider)
      console.log('Signup page: Sign-in successful', result.user.uid)
      
      // Store user data in Firestore
      const userData = {
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Signup page: Writing to Firestore')
      await setDoc(doc(db, 'users', result.user.uid), userData)
      console.log('Signup page: Firestore write successful')
      
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      })
      router.push("/onboarding")
    } catch (error: any) {
      console.error('Signup page: Google sign-in error:', error)
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
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSignUp}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                  id="first-name" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                  id="last-name" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
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
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}

