# Health

A log of code-quality checks on this project. Each check is one **run**. Every run gets an ID, a readable report, the tool's raw output, and one row in `log.csv`.

## Run ID

```
YYYYMMDD-HHMM_tool_commit
20260919-0148_react-doctor_cb6dd28
```

| Field    | Meaning                                                   |
|----------|-----------------------------------------------------------|
| `YYYYMMDD-HHMM` | Local date and time of the run (24-hour clock), so runs sort in order |
| `tool`   | Tool name in kebab-case, such as `react-doctor`           |
| `commit` | Short hash of `HEAD` at the time of the run               |

Underscores separate the fields; hyphens only appear inside a field. The ID is the key, and the other details live in the log.

## Layout

```
health/
  README.md    this file
  log.csv      one row per run, oldest first; only ever add rows
  runs/
    <run_id>.html   readable report
    <run_id>.json   the tool's raw output, with absolute paths made relative
```

## log.csv columns

`run_id, date, time, tool, tool_version, commit, score, label, errors, warnings, files_scanned, files_affected, report, data`

## Taking a run

1. Commit first, so the run matches a real commit.
2. Run the tool and save its JSON, for example `npx react-doctor@latest -y --json --json-out health/runs/<run_id>.json`.
3. Replace absolute paths in the JSON with `.`, since this repo is public.
4. Write `runs/<run_id>.html`.
5. Add a row to `log.csv`.

Never edit an old run. If something needs fixing, take a new run.
