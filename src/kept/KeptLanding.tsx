import { ArrowLink, Separator } from './parts.tsx';

const ACTIONS = [
  ['Capture', 'Create a record.'],
  ['Index', 'Give it structure.'],
  ['Annotate', 'Add meaning.'],
  ['Organize', 'Put it into collections / relationships.'],
  ['Query', 'Search and filter it.'],
  ['Retrieve', 'Actually find it again.'],
  ['Connect', 'Relate one reference to another.'],
];

const PROJECT = [
  ['DF.4.2', 'Visual working surface'],
  ['RG.001', 'Reference system'],
  ['Status', 'Active'],
];

export function KeptLanding() {
  return (
    <>
      <section className="KeptContents">
        <h1 className="KeptDisplay KeptCol-hero">A library you can actually operate.</h1>
        <div className="KeptCol-full">
          <ArrowLink href="#/kept/library">Open the library</ArrowLink>
        </div>
      </section>

      <section className="KeptContents">
        <p className="KeptText2 KeptCol-body">
          A structured system for collecting, organizing, contextualizing, and retrieving visual
          references.
        </p>
      </section>

      <Separator />
      <section className="KeptContents" aria-labelledby="kept-access">
        <h2 id="kept-access" className="KeptText2 KeptCol-label">
          Access
        </h2>
        <div className="KeptStack KeptStack-4 KeptCol-body">
          <p className="KeptText2">
            Kept is invite-only while it's in early development. Every account is let in by hand.
          </p>
          <ul className="KeptList KeptListFill">
            <li className="KeptListItem">
              <span className="KeptText2">Members</span>
              <span className="KeptText2">
                <ArrowLink href="#/kept/login">Sign in</ArrowLink>
              </span>
            </li>
            <li className="KeptListItem">
              <span className="KeptText2">Everyone else</span>
              <span className="KeptText2">
                <ArrowLink href="#/kept/request">Request an invite</ArrowLink>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <Separator />
      <section className="KeptContents" aria-labelledby="kept-actions">
        <h2 id="kept-actions" className="KeptText2 KeptCol-label">
          Fundamental actions
        </h2>
        <div className="KeptCol-body">
          <ul className="KeptList">
            {ACTIONS.map(([term, detail]) => (
              <li key={term} className="KeptListItem">
                <span className="KeptText2">{term}</span>
                <span className="KeptText2">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Separator />
      <section className="KeptContents" aria-labelledby="kept-project">
        <h2 id="kept-project" className="KeptText2 KeptCol-label">
          The project
        </h2>
        <div className="KeptCol-body">
          <ul className="KeptList">
            {PROJECT.map(([term, detail]) => (
              <li key={term} className="KeptListItem">
                <span className="KeptText2">{term}</span>
                <span className="KeptText2">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
