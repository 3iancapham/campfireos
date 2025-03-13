"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TrendsPageContent() {
  return (
    <div className="space-y-6 max-w-full">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Social Media Trends</h1>
        <p className="text-muted-foreground">Stay updated with the latest platform changes and industry trends</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Platform Updates & Algorithm Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Instagram Algorithm Update</h3>
                <p className="text-sm text-muted-foreground">
                  Instagram has updated its algorithm to prioritize original content. Reposted content will see reduced
                  reach.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">Updated 3 days ago</div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">TikTok Content Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  TikTok has updated its content guidelines with stricter rules for branded content and sponsorships.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">Updated 1 week ago</div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Twitter Introduces New API Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Twitter has announced new API pricing tiers affecting how third-party apps can interact with the
                  platform.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">Updated 2 weeks ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>Topics Newsfeed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">Digital Marketing Trends</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Marketing</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  The latest research shows video content continues to dominate engagement metrics across all platforms.
                </p>
                <div className="text-xs text-muted-foreground mb-3">
                  Source:{" "}
                  <a href="#" className="text-primary hover:underline">
                    MarketingWeek
                  </a>
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Content Ideas:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Create a short-form video showcasing your product benefits</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Share a behind-the-scenes look at your content creation process</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Post a customer testimonial with engaging visuals</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Create a tutorial video for your most popular product</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Share industry statistics in an infographic format</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">Social Media Platform Updates</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Technology</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  LinkedIn has introduced new AI-powered content suggestions to help creators increase engagement.
                </p>
                <div className="text-xs text-muted-foreground mb-3">
                  Source:{" "}
                  <a href="#" className="text-primary hover:underline">
                    TechCrunch
                  </a>
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Content Ideas:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Share your experience with LinkedIn's new AI tools</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">
                        Create a poll asking followers about their favorite platform features
                      </span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Post tips on how to use the new LinkedIn features effectively</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Compare engagement rates across different social platforms</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="text-xs">Create a guide on adapting to algorithm changes</span>
                      <Button size="sm" variant="outline">
                        Create Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

