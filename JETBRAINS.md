# JetBrains AI Assistant Instructions - webproject

This file provides instructions for JetBrains AI Assistant for the webproject project.

## Project Context

Website built with HTML, CSS, and JavaScript for AI-driven webproject generated with ScAIffold for development and experimentation.
.


## JetBrains IDE Integration

### AI Assistant Features
- **Code Completion**: Use AI-powered suggestions for faster coding
- **Refactoring**: Leverage intelligent refactoring suggestions
- **Code Explanation**: Use "Explain Code" to understand complex logic
- **Test Generation**: Generate unit tests with AI assistance
- **Documentation**: Auto-generate documentation comments
- **Code Review**: Get AI-assisted code review feedback

### Keyboard Shortcuts
- **AI Chat**: `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)
- **Explain Code**: Right-click → AI Actions → Explain
- **Generate Tests**: Right-click → AI Actions → Generate Tests
- **Refactor**: `Ctrl+Alt+Shift+T` (Windows/Linux) or `Cmd+Alt+Shift+T` (Mac)

## Coding Standards

### Web Development
- **IDE**: WebStorm or IntelliJ IDEA
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
1. Run tests (if applicable) using IDE test runner
2. Lint code using IDE's code inspection
3. Build project
4. Review changes: Use IDE's Git integration


## Testing Standards

### Framework
- Use Jest for unit tests
- Use Testing Library for component tests
- Target 80%+ code coverage

### Test Commands
- Run tests: `npm test` or use IDE test runner
- With coverage: `npm test -- --coverage`

## Available Skills

This project includes modular skills in the `skills/` directory. These skills provide specialized guidance for specific tasks:

### Universal Skills (All Projects)
- **ralph** - Autonomous agent loop for iterative user story implementation from PRD files
- **prd** - Generate structured Product Requirements Documents with user stories
- **git-workflow** - Git workflow and commit conventions
- **testing** - Testing standards and best practices

### Project-Specific Skills
- **web-style** - Web development standards and best practices
**Usage**: To use a skill, reference it by name or view the skill file in `skills/<skill-name>/SKILL.md`. The ralph and prd skills work together to enable autonomous development workflows. You can also ask JetBrains AI Assistant to load and apply specific skills.

## IDE-Specific Tips

### Code Completion
- Use AI Assistant for context-aware code suggestions
- Accept suggestions with `Tab` or `Enter`
- Cycle through suggestions with arrow keys

### Refactoring
- Use AI-powered refactoring suggestions
- Extract methods, variables, constants with AI help
- Rename symbols safely with IDE refactoring tools

### Code Review
- Use AI Assistant to review code before committing
- Ask AI to explain complex code sections
- Get suggestions for code improvements

### Documentation
- Generate documentation comments with AI
- Keep documentation up-to-date
- Use AI to improve existing documentation

## Preferences

- **Concise responses**: Provide focused, actionable responses
- **Show examples**: Include code examples when helpful
- **Explain rationale**: Explain the "why" behind changes
- **IDE integration**: Leverage JetBrains IDE features
- **Proactive**: Suggest IDE features that can help
- **Ask for clarity**: Always ask for clarification rather than making assumptions

## Files to Never Commit

- `node_modules/` directory
- `.next/` directory (Next.js)
- `dist/`, `build/` directories
- `.idea/` directory (personal IDE settings)
- `.env` files with secrets
- API keys or tokens
- Large binary files

## Quick Reference Commands

| Task | Command | IDE Shortcut |
|------|---------||--------------|
| Install dependencies | `npm install` | N/A |
| Run dev server | `npm run dev` | N/A |
| Build | `npm run build` | N/A |
| Reformat code | N/A | `Ctrl+Alt+L` / `Cmd+Alt+L` |


---
*Update this file whenever JetBrains AI Assistant makes a mistake or when project standards evolve*
