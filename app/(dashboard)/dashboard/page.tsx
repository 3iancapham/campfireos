import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles, Check, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-full">
      <header className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="p-2 bg-amber-100 rounded-full w-fit">
          <span className="text-2xl">👋</span>
        </div>
        <div>
          <h1 className="text-2xl font-medium">Welcome Home!</h1>
          <p className="text-lg text-muted-foreground">Bianca</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Checklist Item 1 */}
            <div className="p-3 rounded-lg border border-muted hover:border-primary/30 transition-colors">
              <Link href="/strategy">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-14 text-base font-normal p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-medium">
                      1
                    </div>
                    <span>View your Strategy</span>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Checklist Item 2 */}
            <div className="p-3 rounded-lg border border-muted hover:border-primary/30 transition-colors">
              <Link href="/socials">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-14 text-base font-normal p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-medium">
                      2
                    </div>
                    <span>View Recommended Social Accounts</span>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Checklist Item 3 */}
            <div className="p-3 rounded-lg border border-muted hover:border-primary/30 transition-colors">
              <Link href="/socials/new">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-14 text-base font-normal p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-medium">
                      3
                    </div>
                    <span>Connect Your First Social Account</span>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage your Social Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg border border-muted">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Automated Content Creation</h3>
                    <p className="text-sm text-muted-foreground">AI-powered tools to generate engaging posts</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-muted">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Multi-Platform Management</h3>
                    <p className="text-sm text-muted-foreground">Manage all your accounts in one place</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 bg-orange-50 p-4 rounded-lg">
              <div className="flex-shrink-0 text-orange-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-orange-500 font-medium">Tip</span>
                <p className="text-sm">
                  Connect your social media accounts to create AI-powered bots that help you manage and post content
                  automatically :)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Link href="/posts">
              <Button variant="link" className="text-orange-500">
                See All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Empty state */}
              {true && (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 text-muted" />
                  <p>Your recent social media posts will appear here</p>
                </div>
              )}

              {/* When there are posts, this will be shown instead */}
              {false && <div className="space-y-4">{/* Sample posts would go here */}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-none">
          <CardContent className="pt-6">
            <div className="mb-2">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">NEW</span>
            </div>
            <h3 className="text-lg font-medium mb-4">Check out the latest social media trends in the Trends tab!</h3>
            <div className="flex justify-center">
              <img
                src="/placeholder.svg?height=150&width=200"
                alt="Trends illustration"
                className="h-[150px] object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

