# OpenClaw Orchestrator

A local-first prototype for coordinating multiple OpenClaw workers on the same codebase.

## Problem
Multiple coding agents can help, but letting them all edit the same checkout at once is a mess.
This project proposes a coordinator + worktree isolation model.

## Principles
- one task, one owner
- one worktree per task
- dependency-aware scheduling
- path-conflict prevention
- human-approved merges

## Docs
- `docs/architecture.md`
- `docs/scheduler.md`
- `docs/mvp.md`
- `src/task-schema.json`

## Next implementation steps
1. Add a SQLite schema for tasks/workers/runs.
2. Implement runnable-task selection.
3. Implement path conflict detection.
4. Implement git worktree creation.
5. Add a small CLI or web UI.
6. Wire in OpenClaw worker execution.
