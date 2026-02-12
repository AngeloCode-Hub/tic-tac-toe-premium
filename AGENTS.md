# Agent Instructions - webproject

This file provides instructions for Cursor's AI Agent.

## Project Context

Website built with HTML, CSS, and JavaScript for AI-driven webproject generated with ScAIffold for development and experimentation.
.


## Coding Standards

### Web Development
- Write semantic HTML5
- Use modern CSS (Flexbox/Grid)
- ES6+ JavaScript

### Naming Conventions
- Components: PascalCase
- Functions/variables: camelCase
- CSS classes: kebab-case


## Git Workflow

Use Conventional Commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

Pre-commit:
1. Run tests before committing
2. Write clear, concise commit messages

## Workflow Guidelines

### Planning
- Start complex tasks in Plan mode
- Get the plan right before implementing
- Break large tasks into smaller, focused steps

### Verification
- Always verify work with tests when available
- Run linter after making changes
- Test UI changes in browser when applicable


### Error Handling
- Use try-except/catch with proper logging
- Provide clear error messages
- Don't silently ignore exceptions

## Available Skills

This project includes modular skills in the `skills/` directory:

### Universal Skills
- **ralph** - Autonomous agent loop for iterative user story implementation from PRD files
- **prd** - Generate structured Product Requirements Documents with user stories
- **git-workflow** - Git workflow and commit conventions
- **testing** - Testing standards and best practices

### Project-Specific Skills
- **web-style** - Web development standards
**Usage**: Reference skills by name or view `skills/<skill-name>/SKILL.md`. The ralph and prd skills enable autonomous development workflows.

## Tools and Commands

| Task | Command |
|------|---------|\n| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Run tests | `npm test` |


## Preferences

- Provide concise, focused responses
- Show code examples when helpful
- Explain the "why" behind changes
- Prefer editing existing files over creating new ones
- Only create documentation when explicitly requested
