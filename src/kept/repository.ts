// Mock repository for the lab. Same UI-facing shape the real Supabase repository will expose
// (see kept-v0.html: "keep the same UI-facing API"). In memory, so edits reset on reload.

export interface Collection {
  id: string;
  name: string;
  referenceCount: number;
  updatedAt: string; // ISO date
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
}

let collections: Collection[] = [
  { id: 'type-specimens', name: 'Type specimens', referenceCount: 42, updatedAt: '2026-09-16' },
  { id: 'wayfinding', name: 'Wayfinding', referenceCount: 18, updatedAt: '2026-09-12' },
  { id: 'packaging', name: 'Packaging', referenceCount: 27, updatedAt: '2026-09-10' },
  { id: 'brutalist-interiors', name: 'Brutalist interiors', referenceCount: 9, updatedAt: '2026-09-03' },
  { id: 'swiss-posters', name: 'Swiss posters', referenceCount: 51, updatedAt: '2026-08-28' },
  { id: 'motion-studies', name: 'Motion studies', referenceCount: 3, updatedAt: '2026-08-21' },
  { id: 'annual-reports', name: 'Annual reports', referenceCount: 14, updatedAt: '2026-08-14' },
  { id: 'unsorted', name: 'Unsorted', referenceCount: 0, updatedAt: '2026-08-02' },
];

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
  };
  collections = [collection, ...collections];
  return collection;
}

// ─── References ───

const referenceCache = new Map<string, Reference[]>();

export async function listReferences(collectionId: string): Promise<Reference[]> {
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return [];
  let list = referenceCache.get(collectionId);
  if (!list) {
    list = generateReferences(collection);
    referenceCache.set(collectionId, list);
  }
  return list;
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
  return next;
}

// ─── Fixtures ───

const TITLES: Record<string, string[]> = {
  'type-specimens': [
    'Grotesk No. 9 specimen',
    'Caslon broadside',
    'Akzidenz sample sheet',
    'Futura promotional booklet',
    'Univers weight chart',
    'Didot foundry proof',
    'Clarendon wood type',
    'Gill Sans catalogue',
  ],
  wayfinding: [
    'Airport gate signage',
    'Metro line diagram',
    'Hospital floor directory',
    'Parking level markers',
    'Campus map totem',
    'Museum room numbers',
  ],
  packaging: [
    'Matchbox label',
    'Tea tin',
    'Pharmacy carton',
    'Soap wrapper',
    'Record sleeve',
    'Cigarette pack',
    'Coffee bag',
  ],
  'brutalist-interiors': [
    'Concrete stairwell',
    'Library reading room',
    'Chapel ceiling',
    'Bank lobby',
    'Housing block corridor',
  ],
  'swiss-posters': [
    'Konzert poster',
    'Kunsthalle exhibition',
    'Der Film poster',
    'Tonhalle season',
    'Plakat for safety',
    'Olympic games poster',
  ],
  'motion-studies': ['Title sequence frames', 'Loading loop', 'Kinetic type sketch'],
  'annual-reports': [
    'Chemical company report',
    'Bank annual review',
    'Airline report cover',
    'Utilities data spread',
  ],
};

// Capture sources; null means uploaded from disk.
const SOURCES: (string | null)[] = [
  'https://archive.org/details/',
  'https://fontsinuse.com/uses/',
  'https://www.are.na/block/',
  'https://letterformarchive.org/items/',
  'https://collection.cooperhewitt.org/objects/',
  'https://www.flickr.com/photos/archive/',
  null,
];

const TAGS: Record<string, string[]> = {
  'type-specimens': ['serif', 'grotesk', 'specimen', 'letterpress', 'weights', 'foundry'],
  wayfinding: ['signage', 'pictograms', 'color coding', 'arrows', 'maps'],
  packaging: ['label', 'print', 'retail', 'color', 'illustration'],
  'brutalist-interiors': ['concrete', 'light', 'stairs', 'texture'],
  'swiss-posters': ['grid', 'photo', 'type-only', 'red', 'Helvetica'],
  'motion-studies': ['loop', 'easing', 'type'],
  'annual-reports': ['charts', 'covers', 'data', 'grid'],
};

const FORMATS: { type: string; ext: string; bytesPerPixel: number }[] = [
  { type: 'JPEG', ext: 'jpg', bytesPerPixel: 0.35 },
  { type: 'PNG', ext: 'png', bytesPerPixel: 1.4 },
  { type: 'TIFF', ext: 'tif', bytesPerPixel: 3 },
  { type: 'WebP', ext: 'webp', bytesPerPixel: 0.25 },
];
const SIZES = [
  [2400, 2400],
  [3000, 2000],
  [2000, 3000],
  [1600, 2000],
  [3200, 2400],
];

// Deterministic "random" so fixtures look the same on every load.
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function generateReferences(collection: Collection): Reference[] {
  const titles = TITLES[collection.id] ?? [collection.name];
  const tagPool = TAGS[collection.id] ?? [];
  const random = seeded(collection.id);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];
  const updated = new Date(`${collection.updatedAt}T12:00:00`);

  return Array.from({ length: collection.referenceCount }, (_, i) => {
    const round = Math.floor(i / titles.length);
    const title = titles[i % titles.length] + (round > 0 ? ` ${round + 1}` : '');
    const [width, height] = pick(SIZES);
    const added = new Date(updated);
    added.setDate(added.getDate() - i * 2);
    const tags = tagPool.filter(() => random() < 0.35).slice(0, 3);
    const format = pick(FORMATS);
    const source = pick(SOURCES);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
      id: `${collection.id}-${String(i + 1).padStart(3, '0')}`,
      collectionId: collection.id,
      title,
      addedAt: added.toISOString().slice(0, 10),
      captureUrl: source ? `${source}${10000 + Math.floor(random() * 89999)}` : null,
      fileName: `${slug}.${format.ext}`,
      fileType: format.type,
      width,
      height,
      bytes: Math.round(width * height * format.bytesPerPixel * (0.85 + random() * 0.3)),
      notes:
        i === 0
          ? 'Tight spacing on the display sizes. Compare the lowercase g with the 1962 cut.'
          : i % 5 === 1
            ? 'Good reference for the hierarchy between headline and caption.'
            : '',
      tags: tags.length > 0 || tagPool.length === 0 ? tags : [pick(tagPool)],
      pins:
        i === 0
          ? [
              { id: 'p1', x: 0.28, y: 0.3, caption: 'Ink trap on the lowercase a' },
              { id: 'p2', x: 0.66, y: 0.62, caption: 'Figures sit on the baseline' },
            ]
          : [],
    };
  });
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

const SHARES_KEY = 'kept.lab.shares';

// One board is published from the start so there's always something to open.
const SEED_SHARES: Record<string, Share> = {
  'type-specimens': { token: 'tsp8f3k2qx', owner: 'wade', publishedAt: '2026-09-17' },
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
