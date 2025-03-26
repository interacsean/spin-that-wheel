import { useEffect, useState } from "react";
import { collection, doc, Firestore, onSnapshot, setDoc } from "firebase/firestore";

let firestoreDb: Firestore;

export function setFirestoreDb(externalFirestoreDb: Firestore) {
  firestoreDb = externalFirestoreDb;
}

export function useCollectionSnapshot<T>(collectionName: string, db = firestoreDb) {
  const [data, setData] = useState<{ data: T, id: string }[] | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (querySnapshot) => {
      const docsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data() as T,
      }))
      setData(docsData);
    });
    return () => unsub();
  }, [db, collectionName]);

  return data;
}

export function useDocSnapshot<T>(collectionName: string, documentId: string, db = firestoreDb) {
  const [data, setData] = useState<{ data: T, id: string } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, collectionName, documentId), (doc) => {
      setData({
        id: doc.id,
        data: doc.data() as T,
      });
    });
    return () => unsub();
  }, [db, collectionName, documentId]);

  return data;
}

export function useUpdateDocument<T extends { [x: string]: any; }>
  (collectionName: string, documentId: string, db = firestoreDb) {
  return (data: T) => {
    setDoc(doc(db, collectionName, documentId), data);
  }
}
