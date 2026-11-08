/**
 * Neon PostgreSQL Client-Side Synchronization Service
 * Replaces Firebase Firestore with high-performance Neon PostgreSQL serverless backend.
 */

export interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  activeListeners: number;
}

// Global broadcast channel for instant multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('kashf_neon_sync');
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Checks if a collection has already been seeded in Neon PostgreSQL
 */
export async function isCollectionSeeded(collectionKey: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/db/metadata?key=initial_seed`);
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.value?.[collectionKey];
  } catch (error) {
    console.warn(`[Neon] Failed to check seed status for ${collectionKey}:`, error);
    return false;
  }
}

/**
 * Marks a collection as seeded in Neon PostgreSQL
 */
export async function markCollectionSeeded(collectionKey: string): Promise<void> {
  try {
    // Read current metadata first
    const getRes = await fetch(`/api/db/metadata?key=initial_seed`);
    let currentVal = {};
    if (getRes.ok) {
      const getJson = await getRes.json();
      currentVal = getJson.value || {};
    }
    const updated = {
      ...currentVal,
      [collectionKey]: true,
      updatedAt: new Date().toISOString(),
    };
    await fetch(`/api/db/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'initial_seed', value: updated }),
    });
  } catch (error) {
    console.warn(`[Neon] Failed to mark ${collectionKey} as seeded:`, error);
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

    // Check if documents already exist in the database
    const checkRes = await fetch(`/api/db/collections/${collectionName}`);
    if (checkRes.ok) {
      const json = await checkRes.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        await markCollectionSeeded(collectionName);
        return;
      }
    }

    if (initialData.length === 0) {
      await markCollectionSeeded(collectionName);
      return;
    }

    console.log(`[Neon PostgreSQL] Seeding ${initialData.length} records into '${collectionName}'...`);
    await fetch(`/api/db/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: collectionName, items: initialData }),
    });

    await markCollectionSeeded(collectionName);
    console.log(`[Neon PostgreSQL] '${collectionName}' successfully seeded.`);
  } catch (error) {
    console.error(`[Neon PostgreSQL] Error seeding '${collectionName}':`, error);
  }
}

/**
 * Real-time collection subscription
 * Automatically polls Neon PostgreSQL and coordinates with BroadcastChannel for instant cross-tab updates.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  let isCancelled = false;

  const fetchCollection = async () => {
    if (isCancelled) return;
    try {
      const res = await fetch(`/api/db/collections/${collectionName}`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} while fetching ${collectionName}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        if (!isCancelled) {
          onData(json.data as T[]);
        }
      }
    } catch (err: any) {
      if (!isCancelled && onError) {
        onError(err);
      }
    }
  };

  // Immediate initial fetch
  fetchCollection();

  // Listen for local/cross-tab mutations via BroadcastChannel
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.collection === collectionName) {
      fetchCollection();
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Refetch when the user refocuses the browser window
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      fetchCollection();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
  }

  // Periodic polling interval to pick up remote multi-device changes (every 12 seconds)
  const intervalId = setInterval(fetchCollection, 12000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    }
  };
}

/**
 * Real-time listener for a single document
 */
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  onData: (data: T | null) => void,
  onError?: (err: Error) => void
): () => void {
  let isCancelled = false;

  const fetchDocument = async () => {
    if (isCancelled) return;
    try {
      const res = await fetch(`/api/db/collections/${collectionName}/${docId}`);
      if (res.status === 404) {
        if (!isCancelled) onData(null);
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} fetching ${collectionName}/${docId}`);
      }
      const json = await res.json();
      if (!isCancelled) {
        onData(json.data as T);
      }
    } catch (err: any) {
      if (!isCancelled && onError) {
        onError(err);
      }
    }
  };

  // Immediate fetch
  fetchDocument();

  // Cross-tab broadcast listener
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.collection === collectionName && (!event.data.id || event.data.id === docId)) {
      fetchDocument();
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Refetch on focus
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      fetchDocument();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
  }

  const intervalId = setInterval(fetchDocument, 15000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    }
  };
}

/**
 * Creates or updates a document in Neon PostgreSQL
 */
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    const res = await fetch(`/api/db/collections/${collectionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      throw new Error(`Failed to save document in ${collectionName}: status ${res.status}`);
    }
    // Notify open tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'MUTATION',
        collection: collectionName,
        id: item.id,
        action: 'save',
      });
    }
  } catch (error) {
    console.error(`[Neon PostgreSQL] Error saving document to '${collectionName}':`, error);
    throw error;
  }
}

/**
 * Permanently deletes a document from Neon PostgreSQL
 */
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    const res = await fetch(`/api/db/collections/${collectionName}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete document ${id} in ${collectionName}`);
    }
    // Notify open tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'MUTATION',
        collection: collectionName,
        id,
        action: 'delete',
      });
    }
  } catch (error) {
    console.error(`[Neon PostgreSQL] Error deleting document ${id} from '${collectionName}':`, error);
    throw error;
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
  const item = { ...data, id: docId };
  await saveDocument(collectionName, item as any);
}

/**
 * Tests the live Neon PostgreSQL connection and calculates round-trip latency
 */
export async function testNeonConnection(): Promise<{
  connected: boolean;
  latency: number;
  provider: string;
  host: string;
  database: string;
  region: string;
  error?: string;
}> {
  const start = performance.now();
  try {
    const res = await fetch('/api/db/status', { cache: 'no-store' });
    const latency = Math.round(performance.now() - start);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        connected: false,
        latency,
        provider: 'Neon PostgreSQL (Serverless)',
        host: 'ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech',
        database: 'neondb',
        region: 'AWS ap-southeast-1',
        error: errJson.error || `HTTP error ${res.status}`,
      };
    }
    const json = await res.json();
    return {
      connected: json.connected ?? true,
      latency: json.latency || latency,
      provider: json.provider || 'Neon PostgreSQL (Serverless)',
      host: json.host || 'ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech',
      database: json.database || 'neondb',
      region: json.region || 'AWS ap-southeast-1',
    };
  } catch (error: any) {
    const latency = Math.round(performance.now() - start);
    return {
      connected: false,
      latency,
      provider: 'Neon PostgreSQL (Serverless)',
      host: 'ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech',
      database: 'neondb',
      region: 'AWS ap-southeast-1',
      error: error.message || 'Network error pinging Neon database',
    };
  }
}

