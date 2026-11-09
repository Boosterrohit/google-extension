const DB_NAME = 'nova-backgrounds';
const STORE_NAME = 'assets';
const VIDEO_KEY = 'custom-background-video';

export const resizeBackgroundImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Could not read the selected image.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('The selected file is not a supported image.'));
    image.onload = () => {
      const scale = Math.min(1, 2200 / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not process the selected image.'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.src = reader.result as string;
  };
  reader.readAsDataURL(file);
});

const openBackgroundDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onerror = () => reject(request.error ?? new Error('Could not open background storage.'));
  request.onsuccess = () => resolve(request.result);
});

export async function saveBackgroundAsset(key: string, file: Blob): Promise<void> {
  const db = await openBackgroundDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(file, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the selected background.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Saving the selected background was cancelled.'));
    });
  } finally {
    db.close();
  }
}

export async function loadBackgroundAsset(key: string): Promise<Blob | null> {
  const db = await openBackgroundDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error('Could not load the saved background.'));
    });
  } finally {
    db.close();
  }
}

export async function deleteBackgroundAsset(key: string): Promise<void> {
  const db = await openBackgroundDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not delete the saved background.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Deleting the saved background was cancelled.'));
    });
  } finally {
    db.close();
  }
}

export const saveBackgroundVideo = (file: File) => saveBackgroundAsset(VIDEO_KEY, file);
export const loadBackgroundVideo = () => loadBackgroundAsset(VIDEO_KEY);
