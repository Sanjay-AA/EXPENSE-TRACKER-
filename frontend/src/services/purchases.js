// frontend/src/services/purchases.js
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

/**
 * Transaction shape:
 * {
 *   userId: string,
 *   amount: number,        // in the currency's minor units or float
 *   currency: string,      // e.g. "INR"
 *   category: string,      // e.g. "Food & Dining"
 *   merchant: string,
 *   note?: string,
 *   date: string,          // ISO date string (YYYY-MM-DD)
 *   createdAt: Timestamp   // serverTimestamp()
 * }
 */

const COL = "transactions";

export async function addPurchase(userId, tx) {
  if (!userId) throw new Error("addPurchase: missing userId");
  const toSave = {
    userId,
    amount: Number(tx.amount),
    currency: tx.currency || "INR",
    category: tx.category || "General",
    merchant: tx.merchant || "",
    note: tx.note || "",
    date: tx.date || new Date().toISOString().slice(0,10),
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, COL), toSave);
  return ref.id;
}

export function listenPurchases(userId, callback) {
  if (!userId) throw new Error("listenPurchases: missing userId");
  const q = query(
    collection(db, COL),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function updatePurchase(id, patch) {
  await updateDoc(doc(db, COL, id), patch);
}

export async function deletePurchase(id) {
  await deleteDoc(doc(db, COL, id));
}
