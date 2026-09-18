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
