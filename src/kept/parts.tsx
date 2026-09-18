import * as React from 'react';

// Shared pieces of the base-ui.com homepage language.

export function Separator() {
  return (
    <div className="KeptCol-separator">
      <div className="KeptSeparator" role="separator" aria-hidden="true" />
    </div>
  );
}

// docs Link `withArrow`: the caret slides and a shaft appears on hover
export function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path className="KeptArrowCaret" d="M6 12L10 8L6 4" />
      <path className="KeptArrowLine" d="M2 8L13 8" />
    </svg>
  );
}

export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="KeptLink KeptLinkArrow KeptText2" href={href}>
      {children}
      <ArrowIcon />
    </a>
  );
}

// docs Link `withArrow`, pointing back
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="KeptLink KeptLinkArrow KeptText1" href={href} data-direction="prev">
      <span className="KeptFlip">
        <ArrowIcon />
      </span>
      {children}
    </a>
  );
}

export function SearchIcon() {
  return (
    <svg
      className="KeptSearchIcon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m11 11 3.5 3.5" />
      <circle cx="7" cy="7" r="5.5" />
    </svg>
  );
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(`${iso}T12:00:00`));
}

// Pages with data-driven titles set their own; KeptApp covers the static ones.
export function useDocumentTitle(title: string | undefined) {
  React.useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}

// "fontsinuse.com" for a captured URL, "Uploaded" for a file from disk
export function sourceLabel(captureUrl: string | null) {
  if (!captureUrl) return 'Uploaded';
  try {
    return new URL(captureUrl).hostname.replace(/^www\./, '');
  } catch {
    return captureUrl;
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

// A reference's image filling its box; nothing when there's no file yet (the box stays gray).
export function ImageFill({ src, eager = false }: { src?: string; eager?: boolean }) {
  if (!src) return null;
  return (
    <img
      className="KeptImageFill"
      src={src}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );
}

// Full images keep their real shape so pins land where they were dropped; placeholders stay square.
export function fullImageStyle(r: { imageUrl?: string; width: number; height: number }) {
  const aspect = r.imageUrl ? r.width / r.height : 1;
  return {
    aspectRatio: String(aspect),
    '--kept-aspect': String(aspect),
  } as React.CSSProperties;
}
