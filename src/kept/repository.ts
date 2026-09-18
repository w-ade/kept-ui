import moodeMatcha from './data/moode-matcha.json';

// Mock repository for the lab. Same UI-facing shape the real Supabase repository will expose
// (see kept-v0.html: "keep the same UI-facing API"). Edits to notes, tags, pins and collection
// descriptions are saved in this browser's localStorage; new collections live in memory only.

export interface Collection {
  id: string;
  name: string;
  referenceCount: number;
  updatedAt: string; // ISO date
  description: string;
  // Thumbnails of the first few references, for the library mosaic
  covers?: string[];
}

export interface Pin {
  id: string;
  // Normalized 0–1 position on the image
  x: number;
  y: number;
  caption: string;
}

// A Reference is the unit of meaning; its file (the Asset) carries the file facts.
// v0 has one asset per reference.
export interface Reference {
  id: string;
  collectionId: string;
  title: string;
  notes: string;
  tags: string[];
  pins: Pin[];
  addedAt: string; // ISO date
  // Where it was captured from; null when it was uploaded from disk
  captureUrl: string | null;
  // Asset (file) facts
  fileName: string;
  fileType: string;
  width: number;
  height: number;
  bytes: number;
  // Web copies of the file; absent for references without an image yet
  imageUrl?: string;
  thumbUrl?: string;
}

// Real images, imported with scripts/import-images.py (web copies in public/collections/).
interface ImportedImage {
  file: string;
  fileName: string;
  fileType: string;
  width: number;
  height: number;
  bytes: number;
}

const IMPORTED: Record<string, { name: string; addedAt: string; images: ImportedImage[] }> = {
  'moode-matcha': { name: 'moode-matcha', addedAt: '2026-09-18', images: moodeMatcha },
};

// ─── Saved edits ───
// Stand-in for the database: what you type survives reloads on this device.

type ReferenceEdit = Partial<Pick<Reference, 'notes' | 'tags' | 'pins'>>;

interface SavedEdits {
  references: Record<string, ReferenceEdit>;
  collections: Record<string, { description?: string }>;
}

const EDITS_KEY = 'kept.lab.edits.v1';

function readEdits(): SavedEdits {
  try {
    const raw = localStorage.getItem(EDITS_KEY);
    if (raw) return JSON.parse(raw) as SavedEdits;
  } catch {
    // Unreadable or blocked storage: start clean.
  }
  return { references: {}, collections: {} };
}

const edits = readEdits();

function writeEdits() {
  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
  } catch {
    // Storage blocked: edits last until reload.
  }
}

let collections: Collection[] = Object.entries(IMPORTED).map(([id, c]) => ({
  id,
  name: c.name,
  referenceCount: c.images.length,
  updatedAt: c.addedAt,
  description: edits.collections[id]?.description ?? '',
  covers: c.images.slice(0, 4).map((img) => `/collections/${id}/thumb/${img.file}`),
}));

export async function listCollections(): Promise<Collection[]> {
  return collections;
}

export async function getCollection(id: string): Promise<Collection | undefined> {
  return collections.find((c) => c.id === id);
}

export async function createCollection(name: string): Promise<Collection> {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'collection';
  let id = base;
  for (let n = 2; collections.some((c) => c.id === id); n += 1) id = `${base}-${n}`;
  const collection: Collection = {
    id,
    name: name.trim(),
    referenceCount: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
    description: '',
  };
  collections = [collection, ...collections];
  return collection;
}

export async function updateCollection(
  id: string,
  patch: Pick<Collection, 'description'>,
): Promise<Collection | undefined> {
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  const next = { ...collections[index], ...patch };
  collections = collections.map((c) => (c.id === id ? next : c));
  edits.collections[id] = { ...edits.collections[id], ...patch };
  writeEdits();
  return next;
}

// ─── References ───

const referenceCache = new Map<string, Reference[]>();

export async function listReferences(collectionId: string): Promise<Reference[]> {
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return [];
  let list = referenceCache.get(collectionId);
  if (!list) {
    list = importedReferences(collection);
    referenceCache.set(collectionId, list);
  }
  return list;
}

// Every reference in every collection, collection order then reference order.
export async function listAllReferences(): Promise<Reference[]> {
  const lists = await Promise.all(collections.map((c) => listReferences(c.id)));
  return lists.flat();
}

export async function updateReference(
  collectionId: string,
  referenceId: string,
  patch: Partial<Pick<Reference, 'notes' | 'tags' | 'pins'>>,
): Promise<Reference | undefined> {
  const list = await listReferences(collectionId);
  const index = list.findIndex((r) => r.id === referenceId);
  if (index === -1) return undefined;
  const next = { ...list[index], ...patch };
  list[index] = next;
  edits.references[referenceId] = { ...edits.references[referenceId], ...patch };
  writeEdits();
  return next;
}

// ─── Imported images → references ───

function importedReferences(collection: Collection): Reference[] {
  const source = IMPORTED[collection.id];
  if (!source) return [];
  return source.images.map((img, i) => ({
    id: `${collection.id}-${img.file.replace(/\.\w+$/, '')}`,
    collectionId: collection.id,
    // No titles yet; numbered until they're named in the app.
    title: `No. ${String(i + 1).padStart(3, '0')}`,
    notes: '',
    tags: [],
    pins: [],
    addedAt: source.addedAt,
    captureUrl: null,
    fileName: img.fileName,
    fileType: img.fileType,
    width: img.width,
    height: img.height,
    bytes: img.bytes,
    imageUrl: `/collections/${collection.id}/full/${img.file}`,
    thumbUrl: `/collections/${collection.id}/thumb/${img.file}`,
  })).map((r) => ({ ...r, ...edits.references[r.id] }));
}

// ─── Boards (published collections) ───
// A collection can be published as an unlisted, read-only board at /m/:token.
// Kept in localStorage so a copied link opens in another tab; the real app stores
// this in collection_shares.

export interface Share {
  token: string;
  owner: string;
  publishedAt: string; // ISO date
}

// Versioned so old saved shares (from the sample collections) don't linger.
const SHARES_KEY = 'kept.lab.shares.v2';

// One board is published from the start so there's always something to open.
const SEED_SHARES: Record<string, Share> = {
  'moode-matcha': { token: 'mm7q2x9kfa', owner: 'wade', publishedAt: '2026-09-18' },
};

function readShares(): Record<string, Share> {
  try {
    const raw = localStorage.getItem(SHARES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Share>) : { ...SEED_SHARES };
  } catch {
    return { ...SEED_SHARES };
  }
}

let shares = readShares();

function writeShares() {
  try {
    localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
  } catch {
    // Storage blocked: sharing still works until reload.
  }
}

// Unguessable enough for an unlisted link. getRandomValues works on plain-http LAN too.
function newToken() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('');
}

export async function getShare(collectionId: string): Promise<Share | undefined> {
  return shares[collectionId];
}

export async function publishCollection(collectionId: string, owner: string): Promise<Share> {
  const existing = shares[collectionId];
  if (existing) return existing;
  const share = { token: newToken(), owner, publishedAt: new Date().toISOString().slice(0, 10) };
  shares = { ...shares, [collectionId]: share };
  writeShares();
  return share;
}

// A new token; the old link stops working immediately.
export async function rotateShare(collectionId: string): Promise<Share | undefined> {
  const existing = shares[collectionId];
  if (!existing) return undefined;
  const share = { ...existing, token: newToken() };
  shares = { ...shares, [collectionId]: share };
  writeShares();
  return share;
}

export async function unpublishCollection(collectionId: string): Promise<void> {
  const { [collectionId]: _removed, ...rest } = shares;
  shares = rest;
  writeShares();
}

export interface Board {
  collection: Collection;
  references: Reference[];
  share: Share;
}

export async function getBoard(token: string): Promise<Board | undefined> {
  const entry = Object.entries(shares).find(([, s]) => s.token === token);
  if (!entry) return undefined;
  const [collectionId, share] = entry;
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return undefined;
  return { collection, references: await listReferences(collectionId), share };
}
