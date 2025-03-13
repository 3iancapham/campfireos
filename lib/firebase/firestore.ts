import { db } from './firebase'
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, addDoc, deleteDoc } from 'firebase/firestore'
import { UserData, UserStrategy, ContentPlan, Post } from '../types'

// User Functions
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) return null
    return userDoc.data() as UserData
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export const updateUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error updating user data:', error)
    return false
  }
}

// Strategy Functions
export const saveUserStrategy = async (userId: string, strategy: UserStrategy) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      strategy,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error saving strategy:', error)
    return false
  }
}

// Content Plan Functions
export const saveContentPlan = async (userId: string, contentPlan: ContentPlan) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      contentPlan,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error saving content plan:', error)
    return false
  }
}

// Post Functions
export const createPost = async (post: Omit<Post, 'id'>) => {
  try {
    const postsRef = collection(db, 'posts')
    const newPost = await addDoc(postsRef, {
      ...post,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return newPost.id
  } catch (error) {
    console.error('Error creating post:', error)
    return null
  }
}

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts')
    const q = query(postsRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
  } catch (error) {
    console.error('Error getting user posts:', error)
    return []
  }
}

export const updatePost = async (postId: string, data: Partial<Post>) => {
  try {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error updating post:', error)
    return false
  }
}

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId))
    return true
  } catch (error) {
    console.error('Error deleting post:', error)
    return false
  }
} 