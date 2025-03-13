const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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
        const userData = userDoc.data()
        const now = new Date().toISOString()
        
        // Prepare the update object
        const updateData = {
          updatedAt: now,
          lastLogin: userData.lastLogin || now,
          createdAt: userData.createdAt || now,
          strategy: userData.strategy || null,
          contentPlan: userData.contentPlan || null
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