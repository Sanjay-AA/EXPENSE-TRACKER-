// frontend/src/services/auth.js
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function logout() {
  await signOut(auth);
}

export function onUserChanged(cb) {
  return onAuthStateChanged(auth, cb);
}
