// frontend/src/hooks/usePurchases.js
import { useEffect, useState } from "react";
import { listenPurchases, addPurchase, updatePurchase, deletePurchase } from "../services/purchases";

/**
 * Simple React hook to tie Firestore data into your UI.
 * Usage:
 * const { items, add, update, remove } = usePurchases(user?.uid);
 */
export default function usePurchases(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = listenPurchases(userId, (rows) => {
      setItems(rows);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [userId]);

  return {
    items,
    loading,
    error,
    add: (tx) => addPurchase(userId, tx).catch(setError),
    update: (id, patch) => updatePurchase(id, patch).catch(setError),
    remove: (id) => deletePurchase(id).catch(setError),
  };
}
