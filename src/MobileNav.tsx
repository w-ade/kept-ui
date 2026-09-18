import * as React from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { Input } from '@base-ui/react/input';
import { ScrollArea } from '@base-ui/react/scroll-area';

export interface NavSection {
  heading: string;
  links: { href: string; label: string; active: boolean }[];
}

// Bottom-sheet navigation, ported from base-ui.com's MobileNav (MobileNav.css / MobileNavDrawer.tsx).
export function MobileNav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({ ...s, links: s.links.filter((l) => l.label.toLowerCase().includes(q)) }))
      .filter((s) => s.links.length > 0);
  }, [query, sections]);

  return (
    <Drawer.Root
      swipeDirection="down"
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(next) => !next && setQuery('')}
    >
      <Drawer.Trigger className="GhostButton MobileNavTrigger" aria-label="Open navigation">
        <MagnifyingGlassIcon className="MobileNavTriggerIcon" />
        <span>Search</span>
      </Drawer.Trigger>
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="MobileNavBackdrop" />
          <Drawer.Viewport className="MobileNavViewport">
            <Drawer.Popup className="MobileNavPopup">
              <Drawer.Title className="bui-sr-only">Navigation</Drawer.Title>
              <div className="MobileNavSearchHeader">
                <div className="MobileNavHandle" />
                <div className="MobileNavSearchInputRoot">
                  <MagnifyingGlassIcon className="MobileNavSearchIcon" />
                  <Input
                    className="MobileNavSearchInput"
                    placeholder="Search"
                    value={query}
                    onValueChange={setQuery}
                    enterKeyHint="search"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      type="button"
                      className="MobileNavClearSearch"
                      aria-label="Clear search"
                      onClick={() => setQuery('')}
                    >
                      <XIcon />
                    </button>
                  )}
                </div>
              </div>
              <Drawer.Content className="MobileNavContent">
                <ScrollArea.Root className="MobileNavScrollAreaRoot">
                  <ScrollArea.Viewport className="MobileNavScrollAreaViewport">
                    <ScrollArea.Content className="MobileNavScrollAreaContent">
                      <nav className="MobileNavPanel" aria-label="Main">
                        {filtered.length === 0 && (
                          <div className="MobileNavEmptyState">No results found.</div>
                        )}
                        {filtered.map((section) => (
                          <div key={section.heading} className="MobileNavSection">
                            <div className="MobileNavHeading">{section.heading}</div>
                            <ul className="MobileNavList">
                              {section.links.map((link) => (
                                <li key={link.href}>
                                  <a
                                    className="MobileNavLink"
                                    href={link.href}
                                    data-active={link.active || undefined}
                                    aria-current={link.active ? 'page' : undefined}
                                    onClick={() => setOpen(false)}
                                  >
                                    <span className="MobileNavLinkText">{link.label}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </nav>
                    </ScrollArea.Content>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar className="MobileNavScrollbar">
                    <ScrollArea.Thumb className="MobileNavScrollbarThumb" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  );
}

function MagnifyingGlassIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="m11 11 3.5 3.5" />
      <circle cx="7" cy="7" r="5.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden>
      <path d="m2 2 8 8M10 2 2 10" strokeLinecap="round" />
    </svg>
  );
}
