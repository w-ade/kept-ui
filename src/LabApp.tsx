import * as React from 'react';
import manifest from './manifest.json';
import { MobileNav, type NavSection } from './MobileNav.tsx';

type DemoModule = { default: React.ComponentType };

// Every CSS Modules demo copied from the Base UI docs, loaded on demand.
const demoLoaders = import.meta.glob<DemoModule>('./demos/*/*/css-modules/index.tsx');
// Your own test pages: drop a file in src/pages/ and it shows up in the nav.
const pageLoaders = import.meta.glob<DemoModule>('./pages/*.tsx');

const lazyCache = new Map<string, React.LazyExoticComponent<React.ComponentType>>();
function lazyFrom(key: string, loader: () => Promise<DemoModule>) {
  let component = lazyCache.get(key);
  if (!component) {
    component = React.lazy(loader);
    lazyCache.set(key, component);
  }
  return component;
}

const testPages = Object.keys(pageLoaders)
  .map((file) => {
    const slug = file.replace('./pages/', '').replace('.tsx', '');
    return { slug, title: slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

class DemoErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <p className="DemoError">Demo failed: {this.state.error.message}</p>;
    }
    return this.props.children;
  }
}

function Demo({ slug, id }: { slug: string; id: string }) {
  const key = `./demos/${slug}/${id}/css-modules/index.tsx`;
  const loader = demoLoaders[key];
  if (!loader) return null;
  const Component = lazyFrom(key, loader);
  return (
    <div className="DemoRoot">
      <div className="DemoPlayground">
        <div className="DemoPlaygroundInner" data-demo="css-modules">
          <DemoErrorBoundary>
            <React.Suspense fallback={null}>
              <Component />
            </React.Suspense>
          </DemoErrorBoundary>
        </div>
      </div>
      <div className="DemoSource">
        <span>{id}</span>
        <span>
          src/demos/{slug}/{id}/css-modules
        </span>
      </div>
    </div>
  );
}

function ComponentPage({ slug }: { slug: string }) {
  const page = manifest.find((p) => p.slug === slug);
  if (!page) return <NotFound />;
  let lastHeading: string | null = null;
  return (
    <>
      <h1 className="MdH1">{page.title}</h1>
      <p className="Subtitle">{page.subtitle}</p>
      {page.demos.map((demo) => {
        const showHeading = demo.heading && demo.heading !== lastHeading;
        lastHeading = demo.heading;
        return (
          <React.Fragment key={demo.id}>
            {showHeading && <h3 className="MdH3">{demo.heading}</h3>}
            <Demo slug={slug} id={demo.id} />
          </React.Fragment>
        );
      })}
    </>
  );
}

function TestPage({ slug }: { slug: string }) {
  const key = `./pages/${slug}.tsx`;
  const loader = pageLoaders[key];
  if (!loader) return <NotFound />;
  const Component = lazyFrom(key, loader);
  return (
    <DemoErrorBoundary>
      <React.Suspense fallback={null}>
        <Component />
      </React.Suspense>
    </DemoErrorBoundary>
  );
}

function Overview() {
  return (
    <>
      <h1 className="MdH1">Base UI Lab</h1>
      <p className="Subtitle">
        Every Base UI docs demo, styled exactly as on base-ui.com, plus your own test pages.
      </p>
      <p className="Paragraph">
        Components come straight from <code>@base-ui/react</code>. Demo styles are the docs'
        CSS Modules, copied verbatim into <code>src/demos</code>. Add a file to{' '}
        <code>src/pages</code> to create a test page.
      </p>
      <Demo slug="popover" id="hero" />
    </>
  );
}

function NotFound() {
  return <h1 className="MdH1">Not found</h1>;
}

function Logo() {
  return (
    <svg width="17" height="24" viewBox="0 0 17 24" fill="currentColor" aria-hidden>
      <path d="M9.5001 7.01537C9.2245 6.99837 9 7.22385 9 7.49999V23C13.4183 23 17 19.4183 17 15C17 10.7497 13.6854 7.27351 9.5001 7.01537Z" />
      <path d="M8 9.8V12V23C3.58172 23 0 19.0601 0 14.2V12V1C4.41828 1 8 4.93989 8 9.8Z" />
    </svg>
  );
}

// The component lab: every Base UI docs demo in the docs shell. Dev only (see App.tsx).
export default function LabApp({ route }: { route: string }) {
  const [section, slug] = route.split('/');

  let content: React.ReactNode;
  if (!section) content = <Overview />;
  else if (section === 'components' && slug) content = <ComponentPage key={slug} slug={slug} />;
  else if (section === 'pages' && slug) content = <TestPage key={slug} slug={slug} />;
  else content = <NotFound />;

  const sections: NavSection[] = [
    { heading: 'Overview', links: [{ href: '#/', label: 'Home', active: !section }] },
    { heading: 'Kept', links: [{ href: '#/kept', label: 'Landing', active: false }] },
    ...(testPages.length > 0
      ? [
          {
            heading: 'Test pages',
            links: testPages.map((p) => ({
              href: `#/pages/${p.slug}`,
              label: p.title,
              active: section === 'pages' && slug === p.slug,
            })),
          },
        ]
      : []),
    {
      heading: 'Components',
      links: manifest.map((p) => ({
        href: `#/components/${p.slug}`,
        label: p.title,
        active: section === 'components' && slug === p.slug,
      })),
    },
  ];

  return (
    <>
      <header className="Header">
        <div className="HeaderInner">
          <a className="HeaderLogoLink" href="#/" aria-label="Go to the homepage">
            <Logo />
            <span className="HeaderTag">Lab</span>
          </a>
          <div className="HeaderLinks">
            <a className="HeaderDocsLink" href="https://base-ui.com/react/overview/quick-start" target="_blank" rel="noreferrer">
              Docs
            </a>
            <MobileNav sections={sections} />
          </div>
        </div>
      </header>
      <div className="Layout">
        <nav className="SideNav" aria-label="Main">
          {sections.map((s) => (
            <div key={s.heading} className="SideNavSection">
              <div className="SideNavHeading">{s.heading}</div>
              <ul className="SideNavList">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <a
                      className="SideNavLink"
                      href={l.href}
                      data-active={l.active || undefined}
                      aria-current={l.active ? 'page' : undefined}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <main className="Content">{content}</main>
      </div>
    </>
  );
}
