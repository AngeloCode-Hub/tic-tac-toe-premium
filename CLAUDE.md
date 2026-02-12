# Project Memory - webproject

This file provides project memory for Anthropic's Claude Code assistant.

## Project Purpose

Website built with HTML, CSS, and JavaScript for AI-driven webproject generated with ScAIffold for development and experimentation.
.


## Coding Standards

### Web Development
- **HTML**: Semantic HTML5
- **CSS**: Modern CSS (Flexbox/Grid)
- **JavaScript**: ES6+


### General
- Indentation: 4 spaces
- Max line length: 120 characters
- Error handling: Try-catch with logging

## Common Workflows

### Git Workflow
Use Conventional Commits format:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance

### Testing
- Run tests with: `npm test`
- Run with coverage: `npm test -- --coverage`
- Always run tests before committing


### Code Quality
- Lint code: `npm run lint`
- Format code: `npm run format`


## Key Files

- `CLAUDE.md` - This file, Claude Code memory
- `ANTIGRAVITY.md` - Antigravity instructions
- `AGENTS.md` - Cursor agent instructions
- `JETBRAINS.md` - JetBrains AI Assistant instructions
- `skills/` - Modular skills for specific domains

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

## Known Pitfalls

<!-- Add corrections here as you encounter issues -->
<!-- Example: "When creating pytest fixtures, always use scope='function' unless shared state is explicitly needed" -->

## Verification

Before completing any task:
1. Run the test suite if tests exist
2. Run linter to check for issues
3. Verify changes work as expected

---
*Update this file whenever Claude makes a mistake: "Update CLAUDE.md so you don't make that mistake again"*
