import * as React from 'react';
import { Button } from '@base-ui/react/button';
import { KeptBoard } from './KeptBoard.tsx';
import { KeptCollection } from './KeptCollection.tsx';
import { KeptLanding } from './KeptLanding.tsx';
import { KeptLibrary } from './KeptLibrary.tsx';
import { KeptLogin } from './KeptLogin.tsx';
import { KeptReference } from './KeptReference.tsx';
import { ArrowIcon, ArrowLink, Separator } from './parts.tsx';
import { completeMfaForLab, getSession, signOut } from './session.ts';
import './kept.css';

// Kept v0 recreation, lab-only. Routes live under #/kept so nothing touches the real Kept app.
// Shells are modeled on the base-ui.com homepage ((website)/layout.tsx + page.tsx):
// an 8-column grid where sections are `display: contents` and labels sit in the left gutter.

type Shell = 'marketing' | 'auth' | 'app' | 'board';

const MARKETING_NAV = [
  { href: '#/kept', label: 'Landing', route: '' },
  { href: '#/kept/library', label: 'Library', route: 'library' },
  { href: '#/kept/map', label: 'Map', route: 'map' },
];
const AUTH_NAV = MARKETING_NAV.slice(0, 1);
const APP_NAV = MARKETING_NAV.slice(1);

const TITLES: Record<string, string> = {
  '': 'KEPT — A library you can actually operate.',
  login: 'Sign in · KEPT',
  'login/mfa': 'Two-factor · KEPT',
  request: 'Request an invite · KEPT',
  library: 'Library · KEPT',
};

const COMING_NEXT: Record<string, string> = {
  request: 'Request an invite',
  map: 'Map',
};

function shellFor(route: string): Shell {
  if (route.startsWith('m/')) return 'board';
  if (route.startsWith('login') || route === 'request') return 'auth';
  if (route === 'library' || route.startsWith('library/')) return 'app';
  return 'marketing';
}

// Signed-in routes: send the visitor to whichever auth step they still owe.
function useAuthGate(route: string) {
  const session = getSession();
  const redirect =
    shellFor(route) !== 'app' || session?.aal === 'aal2'
      ? null
      : session
        ? '#/kept/login/mfa'
        : '#/kept/login';

  React.useEffect(() => {
    if (redirect) window.location.replace(redirect);
  }, [redirect]);

  return redirect !== null;
}

export function KeptApp({ route }: { route: string }) {
  const redirecting = useAuthGate(route);

  React.useEffect(() => {
    const previous = document.title;
    // Collection and reference pages title themselves once their data loads.
    if (!route.startsWith('library/') && !route.startsWith('m/')) document.title = TITLES[route] ?? 'KEPT';
    return () => {
      document.title = previous;
    };
  }, [route]);

  if (redirecting) return null;

  const shell = shellFor(route);
  // Board shell: a shared, read-only page with no site chrome and no sign-in.
  if (shell === 'board') return <KeptBoard key={route} token={route.slice(2)} />;
  const nav = shell === 'app' ? APP_NAV : shell === 'auth' ? AUTH_NAV : MARKETING_NAV;
  const session = getSession();

  let content: React.ReactNode;
  if (route === '') content = <KeptLanding />;
  else if (route === 'login') content = <KeptLogin />;
  else if (route === 'login/mfa') content = <KeptMfaPlaceholder />;
  else if (route === 'library') content = <KeptLibrary />;
  else if (route.startsWith('library/')) {
    const [, collectionId, referenceId] = route.split('/');
    content = referenceId ? (
      <KeptReference key={referenceId} collectionId={collectionId} referenceId={referenceId} />
    ) : (
      <KeptCollection key={collectionId} collectionId={collectionId} />
    );
  }
  else content = <KeptComingNext label={COMING_NEXT[route]} />;

  return (
    <div className="KeptBody">
      <div className="KeptGrid">
        <header className="KeptContents">
          <a className="KeptWordmark KeptCol-logo" href="#/kept" aria-label="Kept home">
            KEPT
          </a>
          <nav className="KeptStack KeptCol-nav" aria-label="Site">
            {nav.map((item) => (
              <a
                key={item.href}
                className="KeptLink KeptText1"
                href={item.href}
                aria-current={item.route === route ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
            {shell === 'app' && (
              <Button
                className="KeptLink KeptText1 KeptButtonReset KeptButtonText1"
                onClick={() => {
                  signOut();
                  window.location.hash = '#/kept';
                }}
              >
                Sign out
              </Button>
            )}
          </nav>
          <span className="KeptText1 KeptMuted KeptCol-status">
            {shell === 'app' && session ? session.username : 'Early development'}
          </span>
        </header>

        <main className="KeptContents">{content}</main>

        <Separator />
        <footer className="KeptContents">
          <span className="KeptText1 KeptCol-label">© Kept</span>
        </footer>
      </div>
    </div>
  );
}

// Two-factor isn't built yet; this stand-in lets the lab reach the library.
function KeptMfaPlaceholder() {
  return (
    <section className="KeptContents">
      <h1 className="KeptDisplay KeptCol-hero">Two-factor</h1>
      <p className="KeptText2 KeptMuted KeptCol-full">
        Not built in the lab yet. Continue without a code for now.
      </p>
      <div className="KeptCol-full">
        <Button
          className="KeptLink KeptLinkArrow KeptText2 KeptButtonReset"
          onClick={() => {
            completeMfaForLab();
            window.location.hash = '#/kept/library';
          }}
        >
          Continue to library
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}

function KeptComingNext({
  label,
  back = '#/kept',
  backLabel = 'Back to landing',
}: {
  label?: string;
  back?: string;
  backLabel?: string;
}) {
  return (
    <section className="KeptContents">
      <h1 className="KeptDisplay KeptCol-hero">{label ?? 'Not found'}</h1>
      <p className="KeptText2 KeptMuted KeptCol-full">Not built in the lab yet.</p>
      <div className="KeptCol-full">
        <ArrowLink href={back}>{backLabel}</ArrowLink>
      </div>
    </section>
  );
}
