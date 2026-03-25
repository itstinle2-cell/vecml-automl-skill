# OpenClaw Orchestrator Architecture

## Goal
A local-first task manager and coordinator for running multiple OpenClaw agents against the same codebase without chaos.

## Core idea
Use one coordinator plus multiple worker agents. Every worker gets an isolated git worktree and a claimed task with explicit file/folder ownership.

## Components

### 1. Coordinator
Responsible for:
- creating and prioritizing tasks
- enforcing dependency rules
- assigning tasks to workers
- preventing conflicting path ownership
- tracking task status and worker heartbeats
- triggering integration/review steps

### 2. Task Store
Start with SQLite.
Stores:
- tasks
- workers
- runs
- task dependencies
- claimed path scopes
- artifacts / result summaries

### 3. Worker Runner
A lightweight process that:
- polls for available tasks
- claims a task atomically
- creates a git worktree/branch
- invokes OpenClaw on the task prompt
- streams logs/status back
- marks completion/failure

### 4. Git Isolation Layer
Each task gets:
- repo path
- branch name
- worktree path
- allowed paths

This avoids multiple agents mutating the same checkout.

### 5. Integration Lane
A reserved serialized lane for:
- merging completed task branches
- running tests/build
- resolving interface mismatches
- producing release candidates

## Safety / coordination rules
- Only dispatch tasks with all dependencies satisfied
- Do not schedule overlapping `allowedPaths` concurrently
- Reserve one worker slot for integration / QA when concurrency > 2
- Cap concurrency by machine capacity and repo churn
- Require explicit acceptance criteria on every task
- Prefer small tasks over giant ambiguous tasks

## Deployment model
MVP is local-first on one machine. Later it can move to a shared server with a web UI.

## Why this beats shared-branch concurrency
Shared-branch multi-agent editing causes:
- merge conflicts
- unstated interface drift
- race conditions
- hard-to-audit changes

Worktree-per-task keeps concurrency high while preserving reviewability.
