import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import rawConfig from '../../firebase-applet-config.json';

const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(config);

// CRITICAL: Initialize Firestore with database ID from config
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection test helper mandated by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Successfully connected to Firestore database:', config.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firestore client offline. Please verify Firebase configuration.');
    } else {
      console.log('Firestore connection check completed.');
    }
    return false;
  }
}
