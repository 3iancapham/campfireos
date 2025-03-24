import * as admin from 'firebase-admin'
import { UserData, SurveyAnswers } from '@/lib/types'

// Import service account using require since we're in CommonJS mode
const serviceAccount = require('../serviceAccountKey.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
})

const db = admin.firestore()

async function migrateUsers() {
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get()
    
    console.log(`Found ${usersSnapshot.size} users to process`)
    
    // Keep track of progress
    let updated = 0
    let skipped = 0
    let failed = 0
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data() as UserData
        const now = new Date().toISOString()
        
        // Prepare the update object
        const updateData: Partial<UserData> = {
          updatedAt: now,
          lastLogin: userData.lastLogin || now,
          createdAt: userData.createdAt || now,
          strategy: userData.strategy || null,
          contentPlan: userData.contentPlan || null
        }

        // Handle survey answers migration if they exist
        if (userData.surveyAnswers) {
          const oldSurveyAnswers = userData.surveyAnswers
          
          updateData.surveyAnswers = {
            businessType: oldSurveyAnswers.businessType || '',
            mainTopic: oldSurveyAnswers.mainTopic || '',
            subTopic: oldSurveyAnswers.subTopic || '',
            goals: oldSurveyAnswers.goals || [],
            targetAudience: {
              ageGroups: oldSurveyAnswers.targetAudience?.ageGroups || [],
              gender: oldSurveyAnswers.targetAudience?.gender || '',
              interests: oldSurveyAnswers.targetAudience?.interests || [],
              location: oldSurveyAnswers.targetAudience?.location || '',
              customInterests: oldSurveyAnswers.targetAudience?.customInterests || []
            },
            platforms: (oldSurveyAnswers as any).platforms || 
                      (oldSurveyAnswers as any).contentPreferences?.platforms || [],
            challenges: oldSurveyAnswers.challenges || [],
            surveyCompletedAt: oldSurveyAnswers.surveyCompletedAt || now
          } as SurveyAnswers

          console.log(`📋 Migrating survey answers for user: ${userDoc.id}`)
        }

        // Update the user document
        await db.collection('users').doc(userDoc.id).update(updateData)
        console.log(`✅ Updated user: ${userDoc.id}`)
        updated++
      } catch (error) {
        console.error(`❌ Failed to update user ${userDoc.id}:`, error)
        failed++
      }
    }

    // Log final results
    console.log('\nMigration completed!')
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)
    console.log(`Failed: ${failed}`)
    console.log(`Total processed: ${usersSnapshot.size}`)

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateUsers() 