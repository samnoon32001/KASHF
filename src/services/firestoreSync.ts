import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, firebaseConfig, handleFirestoreError, OperationType } from '../firebase';

export interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  activeListeners: number;
}

const SEED_METADATA_DOC = '_metadata/initial_seed';

/**
 * Checks if a collection has already been seeded in Firestore
 */
export async function isCollectionSeeded(collectionKey: string): Promise<boolean> {
  try {
    const metaRef = doc(db, '_metadata', 'initial_seed');
    const snap = await getDoc(metaRef);
    if (!snap.exists()) return false;
    return !!snap.data()?.[collectionKey];
  } catch (error) {
    console.warn(`[Firestore] Failed to check seed status for ${collectionKey}:`, error);
    return false;
  }
}

/**
 * Marks a collection as seeded in Firestore
 */
export async function markCollectionSeeded(collectionKey: string): Promise<void> {
  try {
    const metaRef = doc(db, '_metadata', 'initial_seed');
    await setDoc(metaRef, { [collectionKey]: true, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn(`[Firestore] Failed to mark ${collectionKey} as seeded:`, error);
  }
}

/**
 * Seeds initial documents to a collection if it has not been seeded yet
 */
export async function seedIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
): Promise<void> {
  try {
    const alreadySeeded = await isCollectionSeeded(collectionName);
    if (alreadySeeded) return;

    // Check if documents already exist in the collection
    const existingSnap = await getDocs(collection(db, collectionName));
    if (!existingSnap.empty) {
      await markCollectionSeeded(collectionName);
      return;
    }

    if (initialData.length === 0) {
      await markCollectionSeeded(collectionName);
      return;
    }

    console.log(`[Firestore] Seeding ${initialData.length} records into '${collectionName}'...`);
    const batch = writeBatch(db);
    for (const item of initialData) {
      const docRef = doc(db, collectionName, String(item.id));
      batch.set(docRef, item, { merge: true });
    }
    await batch.commit();
    await markCollectionSeeded(collectionName);
    console.log(`[Firestore] '${collectionName}' successfully seeded.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

/**
 * Real-time listener for a Firestore collection with error handling
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = snapshot.docs.map((d) => ({
        ...(d.data() as T),
        id: d.id,
      }));
      onData(items);
    },
    (error) => {
      console.error(`[Firestore Subscription Error on ${collectionName}]:`, error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
  );
}

/**
 * Real-time listener for a single document
 */
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  onData: (data: T | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, collectionName, docId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as T);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error(`[Firestore Doc Subscription Error on ${collectionName}/${docId}]:`, error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    }
  );
}

/**
 * Creates or updates a document in Firestore
 */
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(item.id));
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

/**
 * Permanently deletes a document from Firestore
 */
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

/**
 * Saves a singleton document (e.g. settings)
 */
export async function saveSingletonDocument<T>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data as any, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}
