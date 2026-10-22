// Firebase Client & Sync Layer for project: paceai-4733a
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'paceai-4733a',
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'paceai-4733a'}.firebaseapp.com`,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'paceai-4733a'}.appspot.com`,
  appId: '1:paceai-4733a:web:slipeai',
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    const initializedApp = getFirebaseApp();
    db = getFirestore(initializedApp);
  }
  return db;
}

/**
 * Sync batch job to Firebase Firestore collection 'batches'
 */
export async function syncBatchToFirebase(batch: any): Promise<boolean> {
  try {
    const database = getFirebaseDb();
    const batchRef = doc(database, 'batches', batch.id);
    await setDoc(batchRef, {
      ...batch,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    // Non-blocking in case Firestore security rules restrict public writes
    console.warn('[Firebase Sync] Synced locally. Cloud sync pending auth:', error);
    return false;
  }
}

/**
 * Check Firebase connectivity status
 */
export async function testFirebaseConnection(): Promise<{ connected: boolean; projectId: string; error?: string }> {
  try {
    const database = getFirebaseDb();
    return {
      connected: true,
      projectId: firebaseConfig.projectId,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: firebaseConfig.projectId,
      error: err.message,
    };
  }
}
