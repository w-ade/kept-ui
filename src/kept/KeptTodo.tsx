import * as React from 'react';
import { Button } from '@base-ui/react/button';
import { Checkbox } from '@base-ui/react/checkbox';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { Separator } from './parts.tsx';

// /todo (signed in): next steps for Kept, suggestions for where to take it, and your own tasks.
// Checked items and your own tasks are remembered in this browser.

interface Task {
  id: string;
  title: string;
  detail?: string;
}

const NEXT_STEPS: Task[] = [
  { id: 'backend', title: 'Stand up the v0 backend', detail: 'Supabase project, schema, Storage, row-level security, signup off.' },
  { id: 'repository', title: 'Swap the mock data for Supabase', detail: 'Same functions, real data: uploads, notes and boards sync everywhere.' },
  { id: 'signin', title: 'Real sign-in', detail: 'Usernames mapped to an email behind the scenes.' },
  { id: 'mfa', title: 'Build the two-factor screen', detail: 'Set up with a QR code, then a six-digit code each sign-in.' },
  { id: 'invites', title: 'Make invite requests reach you', detail: 'Save them to Supabase, or a form service that emails you.' },
  { id: 'boxes', title: 'Box annotations', detail: 'Drag to draw a box on the image, alongside pins.' },
  { id: 'titles', title: 'Rename references', detail: 'Edit titles; uploads use the file name today.' },
  { id: 'search', title: 'Search everything', detail: 'A command-palette search (Base UI Combobox), one keystroke away.' },
  { id: 'board-links', title: 'Board links on kept.design', detail: 'Use the real domain in share links; the iOS app needs it.' },
  { id: 'home-screen', title: 'Home screen app', detail: 'Manifest, icons and safe areas: Stage 0 of the iOS plan.' },
  { id: 'deploy', title: 'Ship to kept.design', detail: 'Vercel environment variables, then point the domain.' },
];

const SUGGESTIONS: Task[] = [
  { id: 's-keep-anywhere', title: 'Keep from anywhere', detail: 'An iOS share extension and a desktop “Keep this” bookmarklet: save an image and where it came from in one tap.' },
  { id: 's-paste-link', title: 'Paste a link to keep it', detail: 'Drop a URL; Kept fetches the image and records the source.' },
  { id: 's-palette', title: 'Color palettes', detail: 'Pull the main colors from each image, then search and filter by color.' },
  { id: 's-smart', title: 'Smart collections', detail: 'Saved searches that fill themselves, like “packaging, added this month”.' },
  { id: 's-bulk', title: 'Select many', detail: 'Multi-select to tag, move or remove in one go.' },
  { id: 's-masonry', title: 'Boards in their real shapes', detail: 'A masonry board that keeps each image’s proportions.' },
  { id: 's-compare', title: 'Compare two', detail: 'References side by side, pins and all, for a crit.' },
  { id: 's-keys', title: 'Keyboard first', detail: '/ to search, J and K to move, T to tag, P to pin.' },
  { id: 's-dupes', title: 'Catch duplicates', detail: 'Warn on upload when an image is already kept.' },
  { id: 's-export', title: 'Take it with you', detail: 'Export a collection as a zip, or a PDF contact sheet.' },
  { id: 's-previews', title: 'Share previews', detail: 'A proper preview card when a board link is pasted into a chat.' },
  { id: 's-resurface', title: 'Resurface', detail: 'A weekly “from your library”: things you kept and forgot.' },
];

const KEY = 'kept.lab.todo.v1';

interface Saved {
  done: string[];
  mine: Task[];
}

function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Saved;
  } catch {
    // Unreadable or blocked storage.
  }
  return { done: [], mine: [] };
}

export function KeptTodo() {
  const [saved, setSaved] = React.useState<Saved>(readSaved);
  const [draft, setDraft] = React.useState('');

  const update = (next: Saved) => {
    setSaved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Not remembered; fine for this visit.
    }
  };

  const toggle = (id: string, checked: boolean) =>
    update({
      ...saved,
      done: checked ? [...saved.done, id] : saved.done.filter((d) => d !== id),
    });

  const addMine = () => {
    const title = draft.trim();
    if (!title) return;
    update({ ...saved, mine: [...saved.mine, { id: `mine-${Date.now().toString(36)}`, title }] });
    setDraft('');
  };

  const doneCount = (tasks: Task[]) => tasks.filter((t) => saved.done.includes(t.id)).length;

  return (
    <>
      <section className="KeptContents">
        <h1 className="KeptDisplay KeptCol-hero">To do</h1>
      </section>

      <section className="KeptContents">
        <p className="KeptText2 KeptCol-body">
          What’s next for Kept, and ideas for where to take it. Check things off as you go.
        </p>
      </section>

      <TaskSection
        id="kept-todo-next"
        heading="Next steps"
        tasks={NEXT_STEPS}
        done={saved.done}
        onToggle={toggle}
        meta={`${doneCount(NEXT_STEPS)} of ${NEXT_STEPS.length} done`}
      />

      <TaskSection
        id="kept-todo-ideas"
        heading="Suggestions"
        tasks={SUGGESTIONS}
        done={saved.done}
        onToggle={toggle}
        meta="Ideas to elevate Kept"
      />

      <Separator />
      <section className="KeptContents" aria-labelledby="kept-todo-mine">
        <div className="KeptStack KeptStack-0 KeptCol-label">
          <h2 id="kept-todo-mine" className="KeptText2">
            Yours
          </h2>
          <span className="KeptText1 KeptMuted">Anything else</span>
        </div>
        <div className="KeptCol-body KeptStack KeptStack-4 KeptStretch">
          {saved.mine.length > 0 && (
            <TaskList
              tasks={saved.mine}
              done={saved.done}
              onToggle={toggle}
              onRemove={(id) =>
                update({
                  done: saved.done.filter((d) => d !== id),
                  mine: saved.mine.filter((t) => t.id !== id),
                })
              }
            />
          )}
          <Field.Root className="KeptSearch">
            <Field.Label className="bui-sr-only">Add a task</Field.Label>
            <Input
              className="KeptText2 KeptInput"
              placeholder="Add a task"
              value={draft}
              onValueChange={setDraft}
              enterKeyHint="done"
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addMine();
                }
              }}
            />
            <Button
              className="KeptLink KeptText1 KeptButtonReset KeptButtonText1"
              disabled={!draft.trim()}
              onClick={addMine}
            >
              Add
            </Button>
          </Field.Root>
        </div>
      </section>
    </>
  );
}

function TaskSection({
  id,
  heading,
  meta,
  ...list
}: {
  id: string;
  heading: string;
  meta: string;
  tasks: Task[];
  done: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <>
      <Separator />
      <section className="KeptContents" aria-labelledby={id}>
        <div className="KeptStack KeptStack-0 KeptCol-label">
          <h2 id={id} className="KeptText2">
            {heading}
          </h2>
          <span className="KeptText1 KeptMuted">{meta}</span>
        </div>
        <div className="KeptCol-body">
          <TaskList {...list} />
        </div>
      </section>
    </>
  );
}

function TaskList({
  tasks,
  done,
  onToggle,
  onRemove,
}: {
  tasks: Task[];
  done: string[];
  onToggle: (id: string, checked: boolean) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <ul className="KeptList">
      {tasks.map((task) => {
        const checked = done.includes(task.id);
        return (
          <li key={task.id} className="KeptListItem KeptTodoRow" data-done={checked || undefined}>
            <label className="KeptTodoLabel">
              <Checkbox.Root
                className="KeptCheckbox"
                checked={checked}
                onCheckedChange={(next) => onToggle(task.id, next)}
              >
                <Checkbox.Indicator className="KeptCheckboxIndicator">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="m2 6.5 2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="KeptStack KeptStack-0">
                <span className="KeptText2 KeptTodoTitle">{task.title}</span>
                {task.detail && <span className="KeptText1 KeptMuted">{task.detail}</span>}
              </span>
            </label>
            {onRemove && (
              <Button
                className="KeptLink KeptText1 KeptButtonReset KeptButtonText1 KeptMuted"
                aria-label={`Remove ${task.title}`}
                onClick={() => onRemove(task.id)}
              >
                Remove
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
