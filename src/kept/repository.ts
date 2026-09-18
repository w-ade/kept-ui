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

export interface Reference {
  id: string;
  collectionId: string;
  title: string;
  source: string;
  year: number;
  addedAt: string; // ISO date
  width: number;
  height: number;
  format: string;
  notes: string;
  tags: string[];
  pins: Pin[];
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

const SOURCES = [
  'archive.org',
  'fontsinuse.com',
  'are.na',
  'letterformarchive.org',
  'collection.cooperhewitt.org',
  'flickr.com',
  'Own scan',
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

const FORMATS = ['JPG', 'PNG', 'TIFF', 'WEBP'];
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
    return {
      id: `${collection.id}-${String(i + 1).padStart(3, '0')}`,
      collectionId: collection.id,
      title,
      source: pick(SOURCES),
      year: 1950 + Math.floor(random() * 70),
      addedAt: added.toISOString().slice(0, 10),
      width,
      height,
      format: pick(FORMATS),
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
