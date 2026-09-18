// Uploaded images for the lab, kept in this browser's IndexedDB (localStorage is far too small).
// Stand-in for Supabase Storage: files never leave the device they were added on.

const DB_NAME = 'kept-lab';
const STORE = 'uploads';

const FULL = 1600;
const THUMB = 480;

export interface StoredUpload {
  id: string;
  collectionId: string;
  title: string;
  addedAt: string; // ISO date
  createdAt: number; // for newest-first order
  fileName: string;
  fileType: string;
  width: number;
  height: number;
  bytes: number;
  full: Blob;
  thumb: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadUploads(): Promise<StoredUpload[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result as StoredUpload[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Private mode or blocked storage: no saved uploads.
    return [];
  }
}

export async function saveUpload(upload: StoredUpload): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(upload);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const TYPES: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/heic': 'HEIC',
  'image/heif': 'HEIF',
  'image/avif': 'AVIF',
};

function fileTypeOf(file: File) {
  if (TYPES[file.type]) return TYPES[file.type];
  const ext = file.name.split('.').pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : 'Image';
}

// Decode with EXIF orientation applied, so phone photos come out upright.
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

// Redrawing on a canvas drops all metadata (camera, location), like the import script does.
async function resize(source: ImageBitmap | HTMLImageElement, max: number): Promise<Blob> {
  const width = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const height = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, max / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Encode failed'))), 'image/jpeg', 0.82);
  });
}

export async function prepareUpload(
  file: File,
  collectionId: string,
  index: number,
): Promise<StoredUpload> {
  const image = await decode(file);
  const width = 'naturalWidth' in image ? image.naturalWidth : image.width;
  const height = 'naturalHeight' in image ? image.naturalHeight : image.height;
  const [full, thumb] = await Promise.all([resize(image, FULL), resize(image, THUMB)]);
  if ('close' in image) image.close();
  const now = Date.now();
  return {
    id: `${collectionId}-u${now.toString(36)}${index}`,
    collectionId,
    title: file.name.replace(/\.[^.]+$/, '') || 'Untitled',
    addedAt: new Date().toISOString().slice(0, 10),
    createdAt: now + index,
    fileName: file.name,
    fileType: fileTypeOf(file),
    width,
    height,
    bytes: file.size,
    full,
    thumb,
  };
}
