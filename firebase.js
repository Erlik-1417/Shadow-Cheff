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
