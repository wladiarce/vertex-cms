# Contributing to VertexCMS

First off, thank you for considering contributing to VertexCMS! It's people like you that help make VertexCMS such a great tool for the Angular + NestJS community.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [How can I contribute?](#how-can-i-contribute)
- [Using AI tools](#using-ai-tools)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Coding standards](#coding-standards)
- [Commit guidelines](#commit-guidelines)
- [Pull request process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to wladiarce@gmail.com.

### Our pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

---

## How can I contribute?

### Reporting bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots or animated GIFs** if applicable
- **Include your environment details** (OS, Node version, Angular version, etc.)

**Bug report template:**
```markdown
## Description
A clear description of the bug.

## Steps to reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected behavior
What you expected to happen.

## Actual behavior
What actually happened.

## Environment
- OS: [e.g., Windows 11, macOS 14]
- Node: [e.g., 20.10.0]
- Angular: [e.g., 20.0.0]
- NestJS: [e.g., 11.0.0]
- VertexCMS: [e.g., 0.1.0]

## Additional context
Any other context about the problem.
```

### Suggesting enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the use case**
- **Describe the current behavior** and **explain the behavior you'd like to see**
- **Explain why this enhancement would be useful**

### Your first code contribution

Unsure where to begin? You can start by looking through the Issues

### Pull requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

---

## Using AI tools

**AI coding assistants are welcome and encouraged!** VertexCMS already leverages AI agents for code reviews, bug fixes, and feature implementations. We recognize that AI tools can significantly boost productivity when used responsibly.

We've been using:
- Gemini 3 for architecture, code reviews and *.md file generation/improvements.
- Claude Sonnet 4.5 for code implementations.

So far, we've been satisfied with the results.

### Core principles

When using AI tools to contribute to VertexCMS, you **must**:

1. **Take full responsibility** for understanding all code changes
2. **Ensure code readability** - the output must be clear and maintainable
3. **Verify functionality** - test that all changes work as intended
4. **Review generated tests** - ensure specs actually test the right behavior

### ❌ Bad practices (avoid these)

**Vague prompts that delegate understanding:**
```
"Fix this issue"
"Implement this functionality"
"Make the tests pass"
```

These prompts lead to:
- Code you don't understand
- Over-engineered solutions
- Tests that pass but don't validate correctness
- Large, unreviewable commits
- And they tend to drain the tokens / increase the bill of your account!

### ✅ Best practices (do this instead)

**1. Understand the problem first**

Before prompting an AI agent:
- Read the issue thoroughly
- Explore the relevant code
- Understand the architecture ([ARCHITECTURE.md](ARCHITECTURE.md) helps!)
- Identify what specifically needs to change

**2. Provide descriptive, specific prompts**

```
"In ContentService.create(), we need to add status field validation.
Currently, the method accepts any data without checking if 'status'
is one of: 'draft', 'published', 'archived'.

Changes needed:
1. Add a STATUS_VALUES constant with allowed values
2. In create(), validate data.status against this constant
3. Throw BadRequestException if invalid
4. Update the corresponding DTO to include status field
5. Add unit tests for valid and invalid status values"
```

**3. Make small, focused commits**

- **Don't**: One commit with 500 lines across 15 files
- **Do**: Multiple commits, each with a single logical change

```bash
# Good commit sequence
git commit -m "feat(core): add STATUS_VALUES constant"
git commit -m "feat(core): add status validation to ContentService.create()"
git commit -m "test(core): add tests for status validation"
```

Small commits:
- Are easier to review
- Make debugging simpler
- Allow partial rollbacks if needed
- Facilitate better code review discussions

**4. Review AI-generated code critically**

Before committing AI-generated code:
- [ ] **Read every line** - don't blindly accept changes
- [ ] **Understand the logic** - can you explain why it works?
- [ ] **Check for over-engineering** - can it be simpler?
- [ ] **Verify imports** - are all dependencies necessary?
- [ ] **Test manually** - does it actually work in the app?
- [ ] **Review tests** - do they test behavior, not implementation?

**5. Iterate and refine**

Don't accept the first AI output:
```
"The previous implementation works but uses a try-catch for control flow.
Refactor to use explicit validation instead. Return early if status is invalid."
```

### Example workflow

**Scenario**: Add draft/publish functionality to collections

```markdown
1. Understand the requirement:
   - Collections need a 'status' field
   - Valid values: draft, published, archived
   - Public API should only return published by default
   - Authenticated users can see drafts with ?draft=true

2. Break down into small tasks:
   □ Add status field to collection schema
   □ Update ContentService.create() to set default status
   □ Add status filter to ContentService.find()
   □ Add ?draft=true query parameter support
   □ Update admin UI to show status field
   □ Add tests for each change

3. Work on one task at a time with AI:
   "Add 'status' field to the Mongoose schema in SchemaDiscoveryService.
   The field should:
   - Be of type String
   - Have enum values: ['draft', 'published', 'archived']
   - Default to 'draft'
   - Be required
   
   Show me only the buildSchema() method changes."

4. Review the AI output
5. Make a small commit
6. Move to the next task
```

### Why small commits matter

Large AI-generated commits are the #1 reason PRs get rejected:
- Reviewers can't verify correctness of hundreds of lines
- Bugs are harder to track down
- Merge conflicts become nightmares
- Partial reverts become impossible

**Remember**: Your commit history tells a story. Make it a readable one.

---

## Development setup

### Prerequisites

- **Node.js**: v22.x or higher
- **npm**: v10.x or higher
- **MongoDB**: v8.x or higher (easiest way is to use a free Atlas Cluster or Docker)
- **Git**: Latest version

### Initial setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/wladiarce/vertex-cms.git
   cd vertex-cms
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start MongoDB** (if using Docker):
   ```bash
   docker-compose up -d mongo
   ```

5. **Run the development servers**:
   ```bash
   # Terminal 1 - Backend
   npx nx serve playground-server

   # Terminal 2 - Frontend
   npx nx serve playground-client
   ```

6. **Access the application**:
   - Frontend: http://localhost:4200
   - Admin Panel: http://localhost:4200/admin
   - API: http://localhost:3000/api

### Running tests

```bash
# Run all tests
npx nx test

# Run tests for a specific project
npx nx test core

# Run tests in watch mode
npx nx test core --watch

# Run E2E tests
npx nx e2e playground-client-e2e
```

### Building

```bash
# Build all projects
npx nx build

# Build a specific project
npx nx build core
```

---

## Project Structure

```
vertex-cms/
├── apps/
│   └── playground/          # Example application
│       ├── client/          # Angular frontend
│       └── server/          # NestJS backend
├── libs/
│   ├── admin/               # Admin panel library
│   ├── common/              # Shared code (decorators, interfaces)
│   ├── core/                # NestJS backend engine
│   └── public/              # Frontend SDK
├── packages/                # Future: Publishable packages
├── ARCHITECTURE.md          # Architecture documentation
├── ROADMAP.md               # Development roadmap
└── CONTRIBUTING.md          # This file
```

---

## Coding standards
Try to stick to these as much as possible

### TypeScript

- Use **TypeScript strict mode**
- Prefer `interface` over `type` for object shapes
- Use **explicit return types** for public methods
- Avoid `any` - use `unknown` if type is truly unknown
- Use **optional chaining** (`?.`) and **nullish coalescing** (`??`)

### Angular

- Use **standalone components** (no NgModules)
- Prefer **signals** over observables for local state
- Use **computed()** for derived state
- Use `OnPush` change detection strategy
- Follow Angular style guide for naming conventions

### NestJS

- Use **dependency injection** for all services
- Follow **SOLID principles**
- Use **DTOs** for request/response validation
- Implement proper **error handling** with custom exceptions
- Use **guards** for authentication/authorization

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.component.ts`)
- **Classes**: PascalCase (e.g., `UserProfileComponent`)
- **Interfaces**: PascalCase with descriptive names (e.g., `CollectionMetadata`)
- **Functions/Methods**: camelCase (e.g., `getUserProfile()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Private properties**: Prefix with underscore (e.g., `_internalState`)

### Code formatting

We use **Prettier** for code formatting and **ESLint** for linting.

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

**Pre-commit hooks** (Husky) will automatically format and lint your code.

---

## Commit guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit message format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build scripts, etc.)

### Scopes

- **core**: Changes to `@vertex/core`
- **admin**: Changes to `@vertex/admin`
- **public**: Changes to `@vertex/public`
- **common**: Changes to `@vertex/common`
- **playground**: Changes to example app
- **docs**: Documentation changes

### Examples

```bash
feat(core): add draft/publish status to collections

fix(admin): resolve form validation issue in block editor

docs(architecture): update usage guide with new patterns

refactor(common): simplify field decorator logic

test(core): add unit tests for ContentService
```

---

## Pull request process

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes** and commit using conventional commits:
   ```bash
   git commit -m "feat(core): add new feature"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feat/my-new-feature
   ```

4. **Create a Pull Request** on GitHub with:
   - Clear title following conventional commits format
   - Description of changes
   - Link to related issue (if applicable)
   - Screenshots/GIFs for UI changes
   - Test coverage information

5. **Checklist before submitting**:
   - [ ] Code follows the style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated (if needed)
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   - [ ] All tests pass locally
   - [ ] Dependent changes merged

6. **Review process**:
   - At least one approval required
   - All CI checks must pass
   - Maintainer will merge or request changes

7. **After merge**:
   - Delete your feature branch
   - Update your local main branch

---

## Testing

### Unit tests

- Write tests for all new features
- Maintain >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('ContentService', () => {
  it('should create a new document', async () => {
    // Arrange
    const data = { title: 'Test' };
    
    // Act
    const result = await service.create('pages', data);
    
    // Assert
    expect(result.title).toBe('Test');
  });
});
```

### Integration tests

- Test API endpoints
- Test database interactions
- Mock external dependencies

### E2E tests

- Test critical user flows
- Use Cypress for frontend E2E
- Test happy paths and error cases

---

## Documentation

### Code documentation

- Add JSDoc comments for public APIs
- Explain **why**, not just **what**
- Include usage examples

```typescript
/**
 * Creates a new collection entry.
 * 
 * This method validates the data against the collection schema,
 * executes beforeChange hooks, and persists to the database.
 * 
 * @param slug - The collection identifier
 * @param data - The entry data to create
 * @returns The created document with generated _id
 * 
 * @example
 * ```typescript
 * const page = await service.create('pages', {
 *   title: 'Home',
 *   slug: 'home'
 * });
 * ```
 */
async create(slug: string, data: any): Promise<any> {
  // Implementation
}
```

### Updating documentation

If your changes affect:
- **API**: Update [ARCHITECTURE.md](ARCHITECTURE.md)
- **Features**: Update [ROADMAP.md](ROADMAP.md)
- **Setup**: Update [README.md](README.md)

---

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/wladiarce/vertex-cms/discussions)
- Ask in issues with the `question` label
- Email: wladiarce@gmail.com

---

## Attribution

This Contributing Guide is adapted from open source contributing guidelines, including those from [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md) and [Ruby on Rails](https://github.com/rails/rails/blob/main/CONTRIBUTING.md).

---

**Thank you for contributing to VertexCMS! 🚀**
