// IndexedDB and LocalStorage persistent storage helper for IT assets and memo files

const DB_NAME = 'itam_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'memo_files';

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export async function saveMemoToIDB(assetId, memoData) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(memoData, assetId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn('IndexedDB save failed:', e);
    return false;
  }
}

export async function getMemoFromIDB(assetId) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(assetId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB get failed:', e);
    return null;
  }
}

export async function deleteMemoFromIDB(assetId) {
  if (!assetId) return true;
  try {
    const db = await openDB();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(assetId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(true);
      } catch (err) {
        resolve(true);
      }
    });
  } catch (e) {
    console.warn('IndexedDB delete non-critical error:', e);
    return true;
  }
}

/**
 * Safely persists assets to localStorage and IndexedDB.
 * Large memoFile Data URLs are stored in IndexedDB to avoid QuotaExceededError in localStorage.
 */
export async function saveAssetsToStorage(assetsList) {
  if (!Array.isArray(assetsList)) return;

  try {
    // 1. Process files into IndexedDB if needed
    const sanitizedAssets = await Promise.all(
      assetsList.map(async (asset) => {
        const copy = { ...asset };
        if (copy.memoFile && typeof copy.memoFile === 'string' && copy.memoFile.length > 20000) {
          // Store heavy file data in IndexedDB
          await saveMemoToIDB(asset.id, copy.memoFile);
          // Replace with lightweight reference in localStorage to save space
          copy.memoFile = `idb:${asset.id}`;
        } else if (!copy.memoFile && asset.id) {
          await deleteMemoFromIDB(asset.id);
        }
        return copy;
      })
    );

    // 2. Safely save metadata to localStorage with fallback
    localStorage.setItem('itam_assets', JSON.stringify(sanitizedAssets));
  } catch (e) {
    console.warn('LocalStorage save warning, falling back to minimal payload:', e);
    try {
      // Strip any remaining large data fields and retry
      const lightweightAssets = assetsList.map((a) => {
        const copy = { ...a };
        if (copy.memoFile && copy.memoFile.length > 500) {
          copy.memoFile = `idb:${a.id}`;
        }
        return copy;
      });
      localStorage.setItem('itam_assets', JSON.stringify(lightweightAssets));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }
}

/**
 * Hydrates assets loaded from localStorage with full memoFile data from IndexedDB.
 */
export async function hydrateAssetsWithIDB(assetsList) {
  if (!Array.isArray(assetsList)) return assetsList;
  return Promise.all(
    assetsList.map(async (asset) => {
      if (asset.memoFile && typeof asset.memoFile === 'string' && asset.memoFile.startsWith('idb:')) {
        const idbData = await getMemoFromIDB(asset.id);
        if (idbData) {
          return { ...asset, memoFile: idbData };
        }
      }
      return asset;
    })
  );
}
