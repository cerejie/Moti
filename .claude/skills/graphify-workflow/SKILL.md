---
name: graphify-workflow
description: How and when to use the graphify knowledge graph in this repo for navigation, relationships, and impact analysis, plus who runs the graph refresh after successful code changes.
---

# Graphify Workflow

`graphify` is a CLI on PATH. The graph lives in `graphify-out/` (git-ignored, so it may be missing
or stale on a fresh clone — check `graphify-out/graph.json` exists before relying on it).

## Use it when

- You need **relationships**: what imports this, what does this depend on, how do two things connect.
- You need **blast radius** before editing shared code (`components/common/`, `hook/common/`,
  `store/common/`, `utils/`).
- You are new to an area and a targeted file read would take more than ~4 opens.

## Do not use it when

- You already know the path (`architecture-navigation` usually gives it) — just open the file.
- The question is a single symbol lookup — `grep` is cheaper.
- The graph is missing. Say so and fall back to targeted search.

## Commands

```bash
graphify query "<question>"          # scoped subgraph for a question (BFS, ~2000 token budget)
graphify path "<A>" "<B>"            # how two nodes connect
graphify explain "<concept>"         # a node and its neighbors, in plain language
graphify affected "<X>"              # reverse traversal — what breaks if X changes
graphify update .                    # AST-only re-extraction — USER RUNS THIS, never Claude
```

`graphify-out/GRAPH_REPORT.md` is for broad architecture review only — do not read it for a normal
task. Use `graphify-out/wiki/index.md` for navigation if it exists.

## The refresh is the user's to run

**Never run `graphify update .` yourself** — it is hand-off work, like a Supabase migration
(`supabase-backend` § F). Read-only commands (`query`, `path`, `explain`, `affected`) stay free to
use at any time; only the rebuild is off limits.

After a code change is implemented and validated, add a one-line reminder above the commit block:

```bash
graphify update .
```

Rules:

- Remind after success, not before.
- Never claim the graph was updated, and never invent command output.
- Doc-only or `.claude/`-only edits need no reminder.
- If a query returns results that look out of date, say the graph may be stale and suggest the
  refresh — do not run it.
- After a refactor that deleted a lot of code, tell the user that `graphify update . --force` is the
  documented escape hatch if the rebuild is rejected for having fewer nodes.
