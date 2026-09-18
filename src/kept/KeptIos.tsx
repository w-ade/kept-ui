import { BackLink } from './parts.tsx';
import { FlowSection, MapLayer, type FlowStep, type Row } from './KeptMap.tsx';

// /ios: the plan for getting Kept onto the iPhone as an app. Upcoming; nothing here is built yet.

const FLOW: FlowStep[] = [
  { depth: 0, term: 'Web app', detail: 'Today: kept-ui.vercel.app in Safari' },
  { depth: 1, term: 'Home screen app', detail: 'Stage 0: icon, full screen, no rebuild' },
  { depth: 2, term: 'Capacitor app', detail: 'Stage 1: this code inside a native shell' },
  { depth: 3, term: 'Native features', detail: 'Stage 2: camera, share sheet, haptics' },
  { depth: 4, term: 'Backend and links', detail: 'Stage 3: Supabase sync, board links open the app' },
  { depth: 5, term: 'TestFlight', detail: 'Stage 4: beta builds for testers' },
  { depth: 6, term: 'App Store', detail: 'Stage 4: public release' },
];

const LAYERS: { id: string; heading: string; intro?: string; rows: Row[]; footnote?: string }[] = [
  {
    id: 'approach',
    heading: 'Approach',
    intro: 'Wrap the web app; don’t rewrite it. One UI for the web and the iPhone.',
    rows: [
      ['Shell', 'Capacitor: puts the Vite build inside a native iOS app (a WKWebView).'],
      ['UI', 'The same React and Base UI code, so the lab stays the single source of the UI.'],
      ['Native', 'Swift only where the web can’t reach: the share extension, later widgets.'],
      ['Not now', 'SwiftUI or React Native. Base UI is web-only, so every screen would be rebuilt.'],
      ['Revisit', 'If scrolling, gestures or offline ever feel wrong in the web view.'],
    ],
  },
  {
    id: 'stage-0',
    heading: 'Stage 0 · Home screen app',
    intro: 'Safari → Share → Add to Home Screen. Works today; a few files make it feel like an app.',
    rows: [
      ['Manifest', 'manifest.webmanifest: name, short name, start URL, display standalone, colors, icons.'],
      ['Icons', 'apple-touch-icon at 180×180, plus 192 and 512 icons in the manifest.'],
      ['Status bar', 'apple-mobile-web-app-status-bar-style, matched to light and dark.'],
      ['Safe areas', 'viewport-fit=cover is set; pad the header and footer with env(safe-area-inset-*).'],
      ['Storage', 'Separate from Safari’s: uploads made in Safari don’t appear, and the other way round.'],
      ['Limits', 'No share sheet entry, no background work. Unused for long, its data can be cleared.'],
    ],
    footnote: 'About an hour. Good enough to live with until Stage 1.',
  },
  {
    id: 'stage-1',
    heading: 'Stage 1 · Capacitor app',
    rows: [
      ['Install', 'pnpm add @capacitor/core @capacitor/ios, and @capacitor/cli as a dev dependency.'],
      ['Configure', 'capacitor.config.ts: appId design.kept.app, appName Kept, webDir dist.'],
      ['Add iOS', 'pnpm exec cap add ios creates the Xcode project in ios/.'],
      ['Build loop', 'pnpm build, then cap sync ios, then cap open ios, then Run on the iPhone.'],
      ['Live reload', 'Point server.url at the LAN dev server (192.168.1.138:5190) while developing.'],
      ['Routing', 'Hash routes work unchanged; the app loads from capacitor://localhost.'],
      ['Storage', 'localStorage and IndexedDB work in the app’s web view; fine until Supabase.'],
      ['Signing', 'Xcode → Signing & Capabilities → your Apple ID. Install by cable.'],
      ['Free account', 'Runs on your own phone; the install expires after 7 days.'],
      ['Paid account', 'Apple Developer Program, $99 a year: year-long installs, TestFlight, App Store.'],
    ],
    footnote: 'Needs Xcode on the Mac. About an afternoon the first time.',
  },
  {
    id: 'stage-2',
    heading: 'Stage 2 · Native features',
    rows: [
      ['Camera', '@capacitor/camera: take a photo or pick from the library straight into a collection.'],
      ['Permissions', 'Info.plist text for camera, photo library and photo saving, in Kept’s voice.'],
      ['Share in', 'A Share Extension (small Swift target): Share → Kept from Safari, Photos or Instagram.'],
      ['Handoff', 'An App Group lets the extension pass files and URLs to the app on next open.'],
      ['Share out', '@capacitor/share: the native share sheet for board links.'],
      ['Feel', '@capacitor/haptics on pin drop; status bar and splash screen plugins.'],
      ['Keyboard', '@capacitor/keyboard so notes and captions stay visible while typing.'],
      ['Links out', '@capacitor/browser opens capture URLs in an in-app Safari view.'],
    ],
    footnote: 'A few days. The share extension is the biggest piece and the best reason to have an app.',
  },
  {
    id: 'stage-3',
    heading: 'Stage 3 · Backend and links',
    rows: [
      ['Sync', 'The v0 Supabase backend replaces device storage, so the phone and the web match.'],
      ['Sign-in', 'Same username, password and two-factor flow; keep the session securely on device.'],
      ['Uploads', 'Resize on the phone (already built), then upload straight to Supabase Storage.'],
      ['Board links', 'Universal Links: kept.design/m/:token opens the app when it’s installed.'],
      ['Setup', 'Associated Domains (applinks:kept.design) plus an apple-app-site-association file on the site.'],
      ['Offline', 'Queue uploads and edits without signal; send them when back online.'],
    ],
    footnote: 'Lands with the v0 backend; the app adds little on top.',
  },
  {
    id: 'stage-4',
    heading: 'Stage 4 · TestFlight and App Store',
    rows: [
      ['Program', 'Apple Developer Program membership ($99 a year).'],
      ['TestFlight', 'Up to 100 internal testers; external testers after a beta review. Builds last 90 days.'],
      ['Listing', 'App Store Connect: name, screenshots, description, privacy details.'],
      ['Privacy', 'A privacy manifest (PrivacyInfo.xcprivacy) and the privacy answers for photos and content.'],
      ['Accounts', 'Apps with accounts must let people delete their account from inside the app.'],
      ['Review risk', 'Guideline 4.2: a plain wrapped website can be rejected. Camera and share-in give it native value.'],
      ['Sign-in', 'Username and password is fine; Sign in with Apple is only required alongside social logins.'],
    ],
    footnote: 'About a week including review.',
  },
  {
    id: 'code-changes',
    heading: 'Changes to this code',
    intro: 'Small, and all safe to make in the web app first.',
    rows: [
      ['Share links', 'Board links use the page’s own address; in the app that’s capacitor://localhost. Use https://kept.design.'],
      ['Safe areas', 'Top inset on the header, bottom inset on the footer and dialogs.'],
      ['External links', 'Open through the in-app browser instead of target=_blank.'],
      ['Copy', 'The native clipboard plugin replaces the http fallback.'],
      ['Images', 'Stop the long-press callout on grid tiles; keep it on the full image.'],
      ['Motion', 'Already CSS-only and reduced-motion aware; no changes.'],
      ['Hover', 'Hover styles are already limited to devices that can hover.'],
    ],
  },
  {
    id: 'order',
    heading: 'Order of work',
    rows: [
      ['1', 'Stage 0 files, and the share-link fix.'],
      ['2', 'Capacitor shell on your own phone with a free account.'],
      ['3', 'Camera and share-in; decide on the paid account here.'],
      ['4', 'v0 backend, then Universal Links for boards.'],
      ['5', 'TestFlight with a few people, then the App Store.'],
    ],
  },
];

export function KeptIos() {
  return (
    <>
      <section className="KeptContents">
        <div className="KeptCol-hero KeptHeading">
          <BackLink href="#/kept/map">System map</BackLink>
          <h1 className="KeptDisplay">Kept on iOS</h1>
        </div>
      </section>

      <section className="KeptContents">
        <p className="KeptText2 KeptCol-body">
          Upcoming. How Kept goes from this web app to an iPhone app without rebuilding the UI:
          the same code in a native shell, then the native pieces only an app can have.
        </p>
      </section>

      <FlowSection id="kept-ios-flow" heading="Path" steps={FLOW} />

      {LAYERS.map((layer) => (
        <MapLayer key={layer.id} {...layer} />
      ))}
    </>
  );
}
