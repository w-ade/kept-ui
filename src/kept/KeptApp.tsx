import * as React from 'react';
import { KeptLanding } from './KeptLanding.tsx';
import { KeptLogin } from './KeptLogin.tsx';
import { ArrowLink, Separator } from './parts.tsx';
import { getSession } from './session.ts';
import './kept.css';

// Kept v0 recreation, lab-only. Routes live under #/kept so nothing touches the real Kept app.
// Shells are modeled on the base-ui.com homepage ((website)/layout.tsx + page.tsx):
// an 8-column grid where sections are `display: contents` and labels sit in the left gutter.

const NAV = [
  { href: '#/kept', label: 'Landing', route: '' },
  { href: '#/kept/library', label: 'Library', route: 'library' },
  { href: '#/kept/map', label: 'Map', route: 'map' },
];

const TITLES: Record<string, string> = {
  '': 'KEPT — A library you can actually operate.',
  login: 'Sign in · KEPT',
  'login/mfa': 'Two-factor · KEPT',
  request: 'Request an invite · KEPT',
};

const COMING_NEXT: Record<string, string> = {
  'login/mfa': 'Two-factor',
  request: 'Request an invite',
};

// Signed-in routes: send the visitor to whichever auth step they still owe.
function useAuthGate(route: string) {
  const needsAuth = route === 'library' || route.startsWith('library/');
  const session = getSession();
  const redirect = !needsAuth || session?.aal === 'aal2' ? null : session ? '#/kept/login/mfa' : '#/kept/login';

  React.useEffect(() => {
    if (redirect) window.location.replace(redirect);
  }, [redirect]);

  return redirect !== null;
}

export function KeptApp({ route }: { route: string }) {
  const redirecting = useAuthGate(route);

  React.useEffect(() => {
    const previous = document.title;
    document.title = TITLES[route] ?? 'KEPT';
    return () => {
      document.title = previous;
    };
  }, [route]);

  if (redirecting) return null;

  // The Auth shell only links home; the Marketing shell carries the site nav.
  const isAuth = route.startsWith('login') || route === 'request';
  const nav = isAuth ? NAV.slice(0, 1) : NAV;

  let content: React.ReactNode;
  if (route === '') content = <KeptLanding />;
  else if (route === 'login') content = <KeptLogin />;
  else content = <KeptComingNext label={COMING_NEXT[route] ?? NAV.find((n) => n.route === route)?.label} />;

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
          </nav>
          <span className="KeptText1 KeptMuted KeptCol-status">Early development</span>
        </header>

        <main className="KeptContents">{content}</main>

        <Separator />
        <footer className="KeptContents">
          <span className="KeptText1 KeptCol-label">© Kept</span>
          <nav className="KeptStack KeptCol-body" aria-label="Studio">
            <a className="KeptLink KeptText1" href="https://onwend.com/" target="_blank" rel="noreferrer">
              ONWEND
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}

function KeptComingNext({ label }: { label?: string }) {
  return (
    <section className="KeptContents">
      <h1 className="KeptDisplay KeptCol-hero">{label ?? 'Not found'}</h1>
      <p className="KeptText2 KeptMuted KeptCol-full">Not built in the lab yet.</p>
      <div className="KeptCol-full">
        <ArrowLink href="#/kept">Back to landing</ArrowLink>
      </div>
    </section>
  );
}
