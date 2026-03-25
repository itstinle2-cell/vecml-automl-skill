# Scheduling Strategy

## Scheduler goals
- maximize safe parallelism
- minimize file conflicts
- keep workers busy with ready work
- avoid assigning tasks blocked by unstable interfaces

## Task model
Each task should include:
- id
- title
- description
- priority
- status
- repoPath
- branchName
- worktreePath
- allowedPaths
- dependencies
- acceptanceCriteria
- estimatedComplexity
- assignedWorker
- resultSummary

## Core scheduling rules
1. Only tasks with completed dependencies are runnable.
2. A task cannot run if any active task overlaps its `allowedPaths`.
3. Prefer higher-priority runnable tasks.
4. Prefer smaller tasks when priorities tie.
5. Keep one integration slot free when active workers >= 3.
6. Auto-retry transient infrastructure failures once; do not auto-retry repeated logic failures.

## Path conflict policy
Example conflicts:
- `frontend/**` conflicts with another task owning `frontend/**`
- `src/**` conflicts with `src/api/**` unless ownership nesting is explicitly allowed
- `docs/**` is usually safe as a low-risk concurrent lane

## Suggested states
- backlog
- ready
- claimed
- running
- blocked
- review
- merged
- failed
- cancelled

## Recommended execution cadence
### For early MVP
- scheduler tick every 5-15 seconds
- worker heartbeat every 10-30 seconds
- stale-run timeout with human-visible alert

## Human-in-the-loop merge policy
For MVP, merges should be approved explicitly after:
- branch diff summary
- tests/build result
- acceptance criteria check

## Scheduling heuristics that matter
- Delay tasks depending on unstable API contracts until interfaces are documented
- Run docs/spec tasks early to unblock downstream workers
- Bundle low-conflict chores into a batch lane (docs/tests/CI)
- Serialize schema migrations and deep refactors
