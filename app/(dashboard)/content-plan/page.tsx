'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserData } from '@/lib/hooks/useUserData'
import { usePosts } from '@/lib/hooks/usePosts'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ContentPlanPage() {
  const router = useRouter()
  const { userData, loading: userLoading } = useUserData()
  const { posts, loading: postsLoading, getPostsByWeek } = usePosts()

  useEffect(() => {
    // If no strategy is found, redirect to strategy page
    if (!userLoading && !userData?.strategy) {
      router.push('/strategy')
    }
  }, [userLoading, userData, router])

  if (userLoading || postsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-gray-600">Loading your content plan...</p>
      </div>
    )
  }

  if (!userData?.contentPlan) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">No Content Plan Found</h2>
          <p className="mb-4 text-gray-600">
            Please generate a content plan based on your strategy.
          </p>
          <button
            onClick={() => router.push('/strategy')}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Return to Strategy
          </button>
        </div>
      </div>
    )
  }

  const { contentPlan } = userData

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Content Plan</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Content Themes</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {contentPlan.themes.map((theme) => (
            <div
              key={theme.id}
              className="rounded-lg p-4 shadow-md"
              style={{ backgroundColor: theme.color + '10' }}
            >
              <h3 className="mb-2 font-medium">{theme.name}</h3>
              <p className="text-sm text-gray-600">{theme.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {[1, 2, 3, 4].map((week) => {
          const weekPosts = getPostsByWeek(week)
          return (
            <div key={week} className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Week {week}</h2>
              {weekPosts.length === 0 ? (
                <p className="text-gray-600">No posts planned for this week yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {weekPosts.map((post) => (
                    <div key={post.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {post.platform}
                        </span>
                        <span className="text-sm text-gray-500">
                          {post.suggestedDate}
                        </span>
                      </div>
                      <h3 className="mb-2 font-medium">{post.topic}</h3>
                      <p className="mb-4 text-sm text-gray-600">
                        {post.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.status}
                        </span>
                        <button className="text-sm text-blue-500 hover:text-blue-600">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 