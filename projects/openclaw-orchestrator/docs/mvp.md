# MVP Plan

## What to build first
A local orchestrator that can manage multiple OpenClaw workers over one repository.

## MVP features
- create tasks with path ownership + dependencies
- list task board/statuses
- claim runnable tasks safely
- create per-task git worktrees
- dispatch work to an OpenClaw worker command/session
- record run logs/status
- mark done/failed/review
- show simple scheduler reasoning in UI or CLI

## Nice-to-have later
- drag-and-drop kanban board
- live log tailing
- merge automation
- cost/time accounting
- multi-repo support
- hosted team mode

## Recommended stack
- Next.js or simple Node web UI
- SQLite + Prisma or Drizzle
- server-side scheduler loop
- git CLI for worktrees
- OpenClaw session/exec integration

## MVP user flow
1. Human creates tasks.
2. Scheduler marks tasks as ready when dependencies clear.
3. Worker claims a task.
4. System creates branch/worktree.
5. Worker executes task against isolated worktree.
6. Worker reports summary and artifacts.
7. Task moves to review.
8. Human approves merge.

## Initial vertical slice
Implement one repo, two workers, three task states, and path-conflict prevention.
That is enough to prove the concept.
