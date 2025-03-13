import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createPost, getUserPosts, updatePost, deletePost } from '../firebase/firestore'
import type { Post } from '../types'

export function usePosts() {
  const { userId } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPosts() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const userPosts = await getUserPosts(userId)
        setPosts(userPosts)
        setError(null)
      } catch (err) {
        setError('Failed to load posts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [userId])

  const addPost = async (postData: Omit<Post, 'id' | 'userId'>) => {
    if (!userId) return null

    try {
      const postId = await createPost({
        ...postData,
        userId
      })
      if (postId) {
        const newPost: Post = {
          id: postId,
          userId,
          ...postData
        }
        setPosts(prev => [...prev, newPost])
      }
      return postId
    } catch (err) {
      console.error('Error creating post:', err)
      return null
    }
  }

  const editPost = async (postId: string, data: Partial<Post>) => {
    try {
      const success = await updatePost(postId, data)
      if (success) {
        setPosts(prev =>
          prev.map(post =>
            post.id === postId ? { ...post, ...data } : post
          )
        )
      }
      return success
    } catch (err) {
      console.error('Error updating post:', err)
      return false
    }
  }

  const removePost = async (postId: string) => {
    try {
      const success = await deletePost(postId)
      if (success) {
        setPosts(prev => prev.filter(post => post.id !== postId))
      }
      return success
    } catch (err) {
      console.error('Error deleting post:', err)
      return false
    }
  }

  const getPostsByWeek = (weekNumber: number) => {
    return posts.filter(post => post.weekNumber === weekNumber)
  }

  const getPostsByStatus = (status: Post['status']) => {
    return posts.filter(post => post.status === status)
  }

  return {
    posts,
    loading,
    error,
    addPost,
    editPost,
    removePost,
    getPostsByWeek,
    getPostsByStatus
  }
} 