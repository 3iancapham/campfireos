import { redirect } from "next/navigation"

export default function RootPage() {
  // In a real app, you would check if the user is authenticated here
  // For now, we'll just redirect to the login page
  redirect("/login")
}

