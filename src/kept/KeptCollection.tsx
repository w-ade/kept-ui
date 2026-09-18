import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { BackLink, SearchIcon, Separator, formatDate, plural, useDocumentTitle } from './parts.tsx';
import { getCollection, listReferences, type Collection, type Reference } from './repository.ts';

type View = 'grid' | 'list';

const VIEW_KEY = 'kept.lab.view';

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

// /library/:collectionId: the references in one collection, as a grid or a ruled list.
export function KeptCollection({ collectionId }: { collectionId: string }) {
  const [collection, setCollection] = React.useState<Collection | null | undefined>(undefined);
  const [references, setReferences] = React.useState<Reference[]>([]);
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState<View>(readView);

  useDocumentTitle(collection ? `${collection.name} · KEPT` : undefined);

  React.useEffect(() => {
    let ignore = false;
    Promise.all([getCollection(collectionId), listReferences(collectionId)]).then(([c, refs]) => {
      if (ignore) return;
      setCollection(c ?? null);
      setReferences(refs);
    });
    return () => {
      ignore = true;
    };
  }, [collectionId]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return references;
    return references.filter((r) =>
      [r.title, r.source, r.notes, ...r.tags, ...r.pins.map((p) => p.caption)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [references, query]);

  if (collection === undefined) return null;
  if (collection === null) {
    return (
      <section className="KeptContents">
        <div className="KeptCol-hero KeptHeading">
          <BackLink href="#/kept/library">Library</BackLink>
          <h1 className="KeptDisplay">Collection not found</h1>
        </div>
      </section>
    );
  }

  const changeView = (next: View) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Not remembered; fine.
    }
  };

  return (
    <>
      <section className="KeptContents">
        <div className="KeptCol-hero KeptHeading">
          <BackLink href="#/kept/library">Library</BackLink>
          <h1 className="KeptDisplay">{collection.name}</h1>
        </div>
      </section>

      <section className="KeptContents">
        <p className="KeptText2 KeptCol-body">
          {plural(collection.referenceCount, 'reference')}. Updated {formatDate(collection.updatedAt)}.
        </p>
      </section>

      <Separator />
      <section className="KeptContents" aria-labelledby="kept-references">
        <div className="KeptStack KeptStack-4 KeptCol-label">
          <h2 id="kept-references" className="KeptText2">
            References
          </h2>
          <ToggleGroup
            className="KeptSegmented"
            aria-label="View"
            value={[view]}
            onValueChange={(value) => {
              if (value[0]) changeView(value[0] as View);
            }}
          >
            <Toggle className="KeptSegmentedItem KeptText1" value="grid">
              Grid
            </Toggle>
            <Toggle className="KeptSegmentedItem KeptText1" value="list">
              List
            </Toggle>
          </ToggleGroup>
        </div>

        <div className="KeptCol-wide KeptStack KeptStack-6">
          {references.length > 0 && (
            <Field.Root className="KeptSearch">
              <Field.Label className="bui-sr-only">Search references</Field.Label>
              <SearchIcon />
              <Input
                className="KeptText2 KeptInput"
                type="search"
                placeholder="Search titles, tags, notes"
                value={query}
                onValueChange={setQuery}
                autoComplete="off"
                enterKeyHint="search"
              />
            </Field.Root>
          )}

          {references.length === 0 && (
            <p className="KeptText2 KeptMuted">Nothing kept here yet.</p>
          )}
          {references.length > 0 && visible.length === 0 && (
            <p className="KeptText2 KeptMuted" role="status">
              No references match “{query.trim()}”.
            </p>
          )}

          {view === 'grid' ? (
            <ul className="KeptFigureGrid" aria-label="References">
              {visible.map((r) => (
                <li key={r.id}>
                  <a className="KeptFigureLink" href={`#/kept/library/${collection.id}/${r.id}`}>
                    <span className="KeptImage" aria-hidden>
                      {r.pins.length > 0 && <span className="KeptImagePinCount">{r.pins.length}</span>}
                    </span>
                    <span className="KeptStack KeptStack-0">
                      <span className="KeptText1 KeptFigureName">{r.title}</span>
                      <span className="KeptText1 KeptMuted KeptTruncate">{r.source}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="KeptList" aria-label="References">
              {visible.map((r) => (
                <li key={r.id}>
                  <a className="KeptRefRow" href={`#/kept/library/${collection.id}/${r.id}`}>
                    <span className="KeptImage KeptImageThumb" aria-hidden />
                    <span className="KeptText2 KeptFigureName">{r.title}</span>
                    <span className="KeptText1 KeptMuted KeptRefRowMeta KeptTruncate">{r.source}</span>
                    <span className="KeptText1 KeptMuted KeptRefRowYear">{r.year}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
