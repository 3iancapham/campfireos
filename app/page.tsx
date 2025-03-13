import { redirect } from "next/navigation"

export default function RootPage() {
  // Redirect to the dashboard page
  redirect("/dashboard")
}

