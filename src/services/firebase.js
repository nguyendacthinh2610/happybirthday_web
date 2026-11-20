import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Default Firebase configuration from environment or localStorage
export function getFirebaseConfig() {
  try {
    const localConfig = localStorage.getItem('birthday_firebase_config');
    if (localConfig) {
      return JSON.parse(localConfig);
    }
  } catch (e) {
    /* ignore JSON parse error */
  }

  // Check Vite env variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.storageBucket);
}

export function saveFirebaseConfig(configObj) {
  if (!configObj) {
    localStorage.removeItem('birthday_firebase_config');
  } else {
    localStorage.setItem('birthday_firebase_config', JSON.stringify(configObj));
  }
}

/**
 * Uploads an image file or base64 data URL to Firebase Storage
 * Returns full original resolution public URL
 */
export async function uploadImageToFirebase(fileOrBase64) {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error('Firebase chưa được cấu hình');
  }

  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const storage = getStorage(app);

  const filename = `photos/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storageRef = ref(storage, filename);

  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
    // Base64 data URL upload
    await uploadString(storageRef, fileOrBase64, 'data_url');
  } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
    await uploadBytes(storageRef, fileOrBase64, {
      contentType: fileOrBase64.type || 'image/jpeg',
    });
  } else {
    throw new Error('Dữ liệu ảnh không hợp lệ');
  }

  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

/**
 * Saves full card data to Firestore and returns an ultra-short 6-char ID
 */
export async function saveCardToFirestore(cardData) {
  const config = getFirebaseConfig();
  if (!config) throw new Error('Firebase chưa được cấu hình');

  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const db = getFirestore(app);

  const cardId = Math.random().toString(36).substring(2, 8);
  await setDoc(doc(db, 'cards', cardId), {
    ...cardData,
    createdAt: Date.now(),
  });
  return cardId;
}

/**
 * Loads card data from Firestore by its short ID
 */
export async function getCardFromFirestore(cardId) {
  try {
    const config = getFirebaseConfig();
    if (!config) return null;

    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const db = getFirestore(app);

    const docSnap = await getDoc(doc(db, 'cards', cardId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.warn('Error fetching card from Firestore:', err);
  }
  return null;
}
