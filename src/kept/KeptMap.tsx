import type { CSSProperties } from 'react';
import { Separator } from './parts.tsx';

// /map: the system map, aligned with the Kept v0 plan (kept-v0.html).
// Layers are labeled sections of ruled rows so it reads on a phone without sideways scrolling.

type Row = [term: string, detail: string];

const FLOW: { depth: number; term: string; detail: string }[] = [
  { depth: 0, term: 'You', detail: 'Username, password and two-factor' },
  { depth: 1, term: 'Library', detail: 'Operate your collections' },
  { depth: 2, term: 'References', detail: 'Images, each with its file' },
  { depth: 2, term: 'Notes and tags', detail: 'Meaning, written down' },
  { depth: 2, term: 'Annotations', detail: 'Pins and boxes on the image' },
  { depth: 2, term: 'Search', detail: 'Titles, notes, tags, captions' },
  { depth: 2, term: 'Share', detail: 'Publish a collection' },
  { depth: 3, term: 'Board', detail: 'Unlisted page at /m/:token' },
  { depth: 4, term: 'Anyone with the link', detail: 'Read-only, no sign-in' },
];

const LAYERS: { id: string; heading: string; intro?: string; rows: Row[]; footnote?: string }[] = [
  {
    id: 'capabilities',
    heading: '1 · Capabilities',
    rows: [
      ['Capture', 'Upload images. Each becomes a Reference with its Asset.'],
      ['Index', 'Titles and tags give it structure.'],
      ['Annotate', 'Notes, and pins or boxes on the image with a short caption.'],
      ['Organize', 'Collections.'],
      ['Query', 'Search titles, notes, tags and pin captions.'],
      ['Retrieve', 'Library grid and list, and each reference’s page.'],
      ['Share', 'Publish a collection as an unlisted, read-only board.'],
    ],
    footnote: 'Connect (links between references) comes later.',
  },
  {
    id: 'domain',
    heading: '2 · Domain model',
    intro: 'The Reference is the unit of meaning; its Asset carries the file facts.',
    rows: [
      ['User', 'Owns everything. One account, let in by hand.'],
      ['Collection', 'A curated grouping of references.'],
      ['Reference', 'Title, notes, tags and annotations. Belongs to collections.'],
      ['Asset', 'The stored file: name, type, pixel size, bytes. One per reference in v0.'],
      ['Annotation', 'A pin or box on an asset, with a caption. Normalized x/y or rect.'],
      ['Tag', 'Labels references.'],
      ['Note', 'Free-form context on a reference.'],
      ['Share', 'Publishes one collection at an unlisted token.'],
    ],
    footnote:
      'Tables: profiles, collections, references, assets, notes, tags, reference_tags, annotations, collection_shares.',
  },
  {
    id: 'application',
    heading: '3 · Application',
    rows: [
      ['Framework', 'Vite + React, a static single-page app.'],
      ['UI', 'Base UI (@base-ui/react) and Kept CSS. No Tailwind, shadcn or MUI.'],
      ['Shells', 'Marketing, Auth, App, Board. No dashboard.'],
      ['Routes', '/, /login, /login/mfa, /library, /library/:id, /m/:token.'],
      ['Dialogs', 'Create collection, upload, share, account and two-factor, search.'],
      ['Annotator', 'An overlay on the image, not a page.'],
      ['Repository', 'One UI-facing data API. Mock today, Supabase next.'],
    ],
  },
  {
    id: 'data',
    heading: '4 · Data',
    rows: [
      ['Postgres', 'Supabase Postgres. Row-level security: your user owns its rows.'],
      ['Auth', 'Supabase Auth. Username and password, then TOTP (AAL2). Signup off.'],
      ['Storage', 'Private bucket. Signed URLs in the library; board images public or signed.'],
      ['Search', 'One SQL function over title, description, notes, tags and pin captions.'],
      ['Boards', 'Read by share token only. Rotate or unpublish at any time.'],
    ],
    footnote:
      'Supabase signs in by email, so each username maps to an email behind the scenes.',
  },
  {
    id: 'infrastructure',
    heading: '5 · Infrastructure',
    rows: [
      ['Vercel', 'Hosts the static app.'],
      ['Supabase', 'Postgres, Auth and Storage.'],
      ['Secrets', 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and Vercel. Never committed.'],
    ],
  },
  {
    id: 'connections',
    heading: 'How it connects',
    rows: [
      ['App → Auth', 'Sign in, then the two-factor challenge.'],
      ['App → Postgres', 'Read and write the domain, under row-level security.'],
      ['App → Storage', 'Upload files; fetch signed URLs to show them.'],
      ['Search → Postgres', 'One query across the text fields.'],
      ['Board link → Postgres', 'Share token in, read-only collection out.'],
      ['Vercel → App', 'Serves the build.'],
    ],
  },
  {
    id: 'later',
    heading: 'Later, not v0',
    rows: [
      ['Connect', 'Typed links between references, and a graph.'],
      ['Enrichment', 'OCR, image understanding, automatic tagging.'],
      ['Semantic search', 'Embeddings with pgvector.'],
      ['Files at scale', 'Cloudflare R2, if Storage cost or scale hurts.'],
      ['Framework', 'Next.js or SSR, only if a route truly needs it.'],
      ['Share previews', 'A small Open Graph endpoint for board links.'],
      ['More pages', '/r/:id permalinks, /settings, a public board gallery.'],
      ['Teams', 'Multi-user access control.'],
    ],
  },
];

export function KeptMap() {
  return (
    <>
      <section className="KeptContents">
        <h1 className="KeptDisplay KeptCol-hero">System map</h1>
      </section>

      <section className="KeptContents">
        <p className="KeptText2 KeptCol-body">
          How Kept v0 fits together: a Vite + React app built on Base UI, hosted on Vercel, with
          Supabase for data, sign-in and files.
        </p>
      </section>

      <Separator />
      <section className="KeptContents" aria-labelledby="kept-map-flow">
        <h2 id="kept-map-flow" className="KeptText2 KeptCol-label">
          Flow
        </h2>
        <div className="KeptCol-body">
          <ol className="KeptList KeptFlow">
            {FLOW.map((step) => (
              <li
                key={step.term}
                className="KeptListItem KeptFlowRow"
                style={{ '--kept-depth': step.depth } as CSSProperties}
              >
                <span className="KeptText2">
                  {step.depth > 0 && (
                    <span className="KeptMuted" aria-hidden>
                      →{' '}
                    </span>
                  )}
                  {step.term}
                </span>
                <span className="KeptText1 KeptMuted">{step.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {LAYERS.map((layer) => (
        <MapLayer key={layer.id} {...layer} />
      ))}
    </>
  );
}

function MapLayer({
  id,
  heading,
  intro,
  rows,
  footnote,
}: {
  id: string;
  heading: string;
  intro?: string;
  rows: Row[];
  footnote?: string;
}) {
  const headingId = `kept-map-${id}`;
  return (
    <>
      <Separator />
      <section className="KeptContents" aria-labelledby={headingId}>
        <h2 id={headingId} className="KeptText2 KeptCol-label">
          {heading}
        </h2>
        <div className="KeptCol-body KeptStack KeptStack-4 KeptStretch">
          {intro && <p className="KeptText2">{intro}</p>}
          <dl className="KeptList KeptDetails KeptListWide">
            {rows.map(([term, detail]) => (
              <div key={term} className="KeptListItem">
                <dt className="KeptText2">{term}</dt>
                <dd className="KeptText2">{detail}</dd>
              </div>
            ))}
          </dl>
          {footnote && <p className="KeptText1 KeptMuted">{footnote}</p>}
        </div>
      </section>
    </>
  );
}
