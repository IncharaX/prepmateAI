const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length) {
      return admin;
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // Validate required Firebase credentials
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Missing Firebase credentials in environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✓ Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('✗ Firebase initialization error:', error.message);
    throw error;
  }
};

// Export both the function and direct access to admin
module.exports = initializeFirebase;
module.exports.admin = admin;

// Add helper to verify Firebase token
module.exports.verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

// Add helper to get user by UID
module.exports.getFirebaseUser = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    return user;
  } catch (error) {
    throw new Error(`Failed to get Firebase user: ${error.message}`);
  }
};

