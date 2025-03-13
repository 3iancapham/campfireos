const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

async function testConnection() {
  try {
    // Initialize Firebase Admin with REST preference
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      firestore: {
        preferRest: true
      }
    })

    const db = admin.firestore()
    
    // Try to get a single document from users collection
    console.log('Testing connection...')
    const testDoc = await db.collection('users').limit(1).get()
    
    console.log('Connection successful!')
    console.log(`Found ${testDoc.size} user(s)`)
    
    if (testDoc.size > 0) {
      console.log('Sample user data:', testDoc.docs[0].data())
    }
    
    // If we got here, connection works
    process.exit(0)
  } catch (error) {
    console.error('Connection test failed:', error)
    process.exit(1)
  }
}

testConnection() 