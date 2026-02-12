---
name: Ralph
description: Autonomous AI agent loop for iterative user story implementation from PRD files
---

# Ralph - Autonomous Agent Loop

Ralph is an autonomous coding agent system that iteratively implements user stories from a Product Requirement Document (PRD). It works in a loop, implementing one story at a time, running quality checks, and tracking progress.

## Overview

Ralph enables autonomous development by:
- Reading user stories from a `prd.json` file
- Implementing one story per iteration
- Running quality checks (typecheck, lint, test)
- Tracking progress and learnings
- Auto-archiving when switching branches
- Stopping when all stories are complete

## Usage

### Prerequisites

1. **PRD File** (`prd.json`) - Contains user stories with structure:
```json
{
  "branchName": "ralph/feature-name",
  "stories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "Story description",
      "priority": 1,
      "passes": false
    }
  ]
}
```

2. **Progress File** (`progress.txt`) - Tracks implementation progress and learnings

### Running Ralph

**In Antigravity:**
```
Use the Ralph skill to autonomously implement user stories from prd.json
```

**In JetBrains IDE (with AI Assistant):**
```
I want to use the Ralph autonomous agent loop to implement the stories in prd.json
```

**From Command Line (original bash script):**
```bash
./ralph.sh [max_iterations]
```

## Agent Instructions

When activated, follow this workflow for each iteration:

### 1. Setup & Context
- Read `prd.json` in the current directory
- Read `progress.txt` (check **Codebase Patterns** section first)
- Verify you're on the correct branch from PRD `branchName`
  - If not, checkout or create from main

### 2. Select Story
- Pick the **highest priority** user story where `passes: false`
- Focus on ONE story per iteration

### 3. Implementation
- Implement the selected user story
- Follow existing code patterns
- Keep changes focused and minimal

### 4. Quality Checks
Run project-specific quality checks:
- **TypeScript/JavaScript**: `npm run typecheck`, `npm run lint`, `npm test`
- **Python**: `mypy`, `pylint`, `pytest`
- **C#**: `dotnet build`, `dotnet test`
- **Java**: `mvn verify`

**CRITICAL**: Do NOT commit broken code. All checks must pass.

### 5. Browser Testing (Frontend Stories)
For any story that changes UI:
1. Start the dev server
2. Navigate to the relevant page
3. Verify the UI changes work as expected
4. Take screenshots for the progress log

A frontend story is NOT complete until browser verification passes.

### 6. Update Documentation

#### AGENTS.md Files
Before committing, check if edited files have learnings worth preserving:

**Good AGENTS.md additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**
- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

#### Codebase Patterns
If you discover a **reusable pattern**, add it to the `## Codebase Patterns` section at the TOP of `progress.txt`:

```markdown
## Codebase Patterns
- Use `sql<number>` template for aggregations
- Always use `IF NOT EXISTS` for migrations
- Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

### 7. Commit Changes
If all checks pass:
```
git add .
git commit -m "feat: [Story ID] - [Story Title]"
```

### 8. Update PRD
Set `passes: true` for the completed story in `prd.json`

### 9. Log Progress
APPEND to `progress.txt` (never replace):

```markdown
## [Date/Time] - [Story ID]
Thread: [Link to conversation/thread if available]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

The learnings section is critical - it helps future iterations avoid repeating mistakes.

### 10. Check Completion
After completing a user story, check if ALL stories have `passes: true`.

**If ALL stories are complete:**
- Reply with: `✅ Ralph COMPLETE - All user stories implemented and passing`
- Stop the loop

**If stories remain:**
- Continue to next iteration
- The loop will pick up the next highest priority story

## Environment-Specific Adaptations

### Antigravity
- Use native file operations and git commands
- Leverage browser_subagent for UI testing
- Use task_boundary to track progress
- Create artifacts for walkthroughs

### JetBrains IDE AI Assistant
- Use IDE's built-in terminal for commands
- Leverage IDE's test runner for quality checks
- Use IDE's git integration for commits
- Reference files using IDE's file navigation

### VS Code / Cursor
- Use integrated terminal
- Leverage extension APIs where available
- Use source control panel for git operations

## File Structure

```
project-root/
├── prd.json              # User stories and requirements
├── progress.txt          # Progress log and learnings
├── .last-branch          # Tracks current branch (auto-generated)
└── archive/              # Archived runs (auto-generated)
    └── YYYY-MM-DD-branch-name/
        ├── prd.json
        └── progress.txt
```

## Archiving

Ralph automatically archives previous runs when the branch changes:
- Archives to `archive/YYYY-MM-DD-branch-name/`
- Copies `prd.json` and `progress.txt`
- Resets progress file for new run

## Best Practices

1. **One Story at a Time** - Focus on single user story per iteration
2. **Keep CI Green** - Never commit broken code
3. **Read Patterns First** - Always check Codebase Patterns section before starting
4. **Document Learnings** - Help future iterations by documenting patterns and gotchas
5. **Verify UI Changes** - Always test frontend changes in browser
6. **Commit Frequently** - Commit after each successful story implementation
7. **Follow Conventions** - Match existing code patterns and style

## Troubleshooting

**Story keeps failing quality checks:**
- Review the specific error messages
- Check Codebase Patterns for relevant guidance
- Look at similar existing code for patterns

**Can't find prd.json:**
- Ensure you're in the correct directory
- Check if PRD file has different name/location

**Branch issues:**
- Verify `branchName` in prd.json is correct
- Ensure you have permissions to create/checkout branches

**Tests failing:**
- Check if dev server needs to be running
- Verify test data/fixtures are set up
- Review AGENTS.md files for test requirements

## Example PRD

```json
{
  "branchName": "ralph/user-authentication",
  "stories": [
    {
      "id": "US-001",
      "title": "Implement login form",
      "description": "Create a login form with email and password fields",
      "priority": 1,
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Add form validation",
      "description": "Validate email format and password requirements",
      "priority": 2,
      "passes": false
    },
    {
      "id": "US-003",
      "title": "Implement authentication API",
      "description": "Create backend endpoint for user authentication",
      "priority": 3,
      "passes": false
    }
  ]
}
```

## Integration with Other Tools

Ralph works well with:
- **Git workflows** - Automatic branch management and commits
- **CI/CD pipelines** - Ensures all commits pass quality checks
- **Project management tools** - PRD can be generated from Jira, Linear, etc.
- **Code review tools** - Each commit is a complete, tested user story

## Notes

- Ralph is designed for autonomous operation but can be supervised
- Progress tracking enables resuming after interruptions
- Learnings accumulate over time, improving efficiency
- Works with any programming language/framework that has quality checks
