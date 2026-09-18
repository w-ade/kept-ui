import { MapLayer } from './KeptMap.tsx';

// Settings and Referral (signed in): coming soon. They say what they'll hold.

export function KeptSettings() {
  return (
    <>
      <section className="KeptContents">
        <h1 className="KeptDisplay KeptCol-hero">Settings</h1>
      </section>
      <section className="KeptContents">
        <p className="KeptText2 KeptMuted KeptCol-body">Coming soon.</p>
      </section>
      <MapLayer
        id="settings"
        heading="What will live here"
        rows={[
          ['Account', 'Username, password and email.'],
          ['Two-factor', 'Set up or reset your authenticator app.'],
          ['Appearance', 'Light, dark or match system. Already works, from the menu under your name.'],
          ['Boards', 'Everything you’ve shared, with its link, in one place.'],
          ['Export', 'Download your library.'],
          ['Delete account', 'Remove your account and everything in it.'],
        ]}
      />
    </>
  );
}

export function KeptReferral() {
  return (
    <>
      <section className="KeptContents">
        <h1 className="KeptDisplay KeptCol-hero">Referral</h1>
      </section>
      <section className="KeptContents">
        <p className="KeptText2 KeptMuted KeptCol-body">
          Coming soon. Kept stays invite-only; members will get a few invites to pass on.
        </p>
      </section>
      <MapLayer
        id="referral"
        heading="How it will work"
        rows={[
          ['Invites', 'A small number to give out, so the library stays personal.'],
          ['Your link', 'A personal invite link that skips the request queue.'],
          ['Who joined', 'See who used your invites.'],
        ]}
      />
    </>
  );
}
