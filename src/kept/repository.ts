// Mock repository for the lab. Same UI-facing shape the real Supabase repository will expose
// (see kept-v0.html: "keep the same UI-facing API"). In memory, so new collections reset on reload.

export interface Collection {
  id: string;
  name: string;
  referenceCount: number;
  updatedAt: string; // ISO date
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
  const base = name
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
