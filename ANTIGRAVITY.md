# Antigravity Instructions - webproject

This file provides instructions for Google's Antigravity AI assistant for the webproject project.

## Project Context

Website built with HTML, CSS, and JavaScript for AI-driven webproject generated with ScAIffold for development and experimentation.
.


## Coding Standards

### Web Development
- **HTML**: Semantic HTML5 elements
- **CSS**: Modern CSS with flexbox/grid
- **JavaScript**: ES6+ features
- **Accessibility**: WCAG 2.1 Level AA compliance

### Naming Conventions
- Components: `PascalCase` (React/JSX)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`


### Best Practices
- Write semantic, accessible HTML
- Use modern CSS features (Grid, Flexbox, Custom Properties)
- Keep JavaScript modular and maintainable
- Optimize images and assets
- Test across browsers


## Git Workflow

### Conventional Commits
Use the following prefixes:

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no code change |
| `refactor:` | Code change without feature/fix |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance, dependencies |

### Pre-Commit Checklist
1. Run tests (if applicable)
2. Lint code
3. Build project
4. Review changes: `git diff`


## Workflow Guidelines

### Planning Mode
- Start complex tasks in PLANNING mode
- Create `implementation_plan.md` for significant changes
- Get the plan right before implementing
- Break large tasks into smaller, focused steps
- Use `task.md` to track progress with checkboxes

### Execution Mode
- Write code following the standards above
- Make changes incrementally
- Run linter after making changes
- Return to PLANNING if unexpected complexity arises

### Verification Mode
- Always verify work with tests when available
- Run linter to check for issues
- Test UI changes in browser
- Create `walkthrough.md` after completing verification
- Document what was tested and validation results

## Available Skills

This project includes modular skills in the `skills/` directory. These skills provide specialized guidance for specific tasks:

### Universal Skills (All Projects)
- **ralph** - Autonomous agent loop for iterative user story implementation from PRD files
- **prd** - Generate structured Product Requirements Documents with user stories
- **git-workflow** - Git workflow and commit conventions
- **testing** - Testing standards and best practices

### Project-Specific Skills
- **web-style** - Web development standards and best practices
**Usage**: To use a skill, reference it by name or view the skill file in `skills/<skill-name>/SKILL.md`. The ralph and prd skills work together to enable autonomous development workflows.

## Testing Standards

### Framework
- Use Jest for unit tests
- Use Testing Library for component tests
- Target 80%+ code coverage

### Test Commands
- Run tests: `npm test` or use IDE test runner
- With coverage: `npm test -- --coverage`

## Preferences

- **Concise responses**: Provide focused, actionable responses
- **Show examples**: Include code examples when helpful
- **Explain rationale**: Explain the "why" behind changes
- **Edit over create**: Prefer editing existing files over creating new ones
- **Documentation**: Only create documentation when explicitly requested
- **Proactive**: Take obvious follow-up actions (verify builds, run tests)
- **Ask for clarity**: Always ask for clarification rather than making assumptions

## Files to Never Commit

- `node_modules/` directory
- `.next/` directory (Next.js)
- `dist/`, `build/` directories
- `.env` files with secrets
- API keys or tokens
- Large binary files
- IDE-specific files (unless shared team config)

## Quick Reference Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Run dev server | `npm run dev` |
| Build | `npm run build` |
| Run tests | `npm test` |


---
*Update this file whenever Antigravity makes a mistake or when project standards evolve*
