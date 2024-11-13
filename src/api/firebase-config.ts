import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let db: Firestore | null = null;

export const getDb = (): Firestore | null => {
  if (typeof window === "undefined") {
    // Si on est côté serveur, ne pas initialiser Firebase
    return null;
  }

  if (!db) {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_API_KEY,
      authDomain: import.meta.env.VITE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_MESSAGING_SEND,
      appId: import.meta.env.VITE_APP_ID,
      measurementId: import.meta.env.VITE_MEASUREMENT_ID,
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }

  return db;
};
