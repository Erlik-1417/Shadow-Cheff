import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export function firebaseConfigFromEnv(env = import.meta.env) {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  return Object.values(config).every(Boolean) ? config : null;
}

export function isFirebaseConfigured(env = import.meta.env) {
  return Boolean(firebaseConfigFromEnv(env));
}

export function connectFirebase(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return {
    auth,
    register: (email, password) =>
      createUserWithEmailAndPassword(auth, email, password),
    login: (email, password) =>
      signInWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    async saveGame(state) {
      if (!auth.currentUser) throw new Error("Oturum açmalısınız.");
      await setDoc(doc(db, "games", auth.currentUser.uid), {
        state,
        updatedAt: serverTimestamp(),
      });
    },
    async loadGame() {
      if (!auth.currentUser) throw new Error("Oturum açmalısınız.");
      const snapshot = await getDoc(doc(db, "games", auth.currentUser.uid));
      return snapshot.exists() ? snapshot.data().state : null;
    },
  };
}
