# Contributing to Right2

Thank you for your interest in contributing to Right2! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Setting Up Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jobstuff.git
   cd jobstuff
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage
```

### Code Quality

Before committing your changes, ensure your code passes all quality checks:

```bash
# Run linter
npm run lint

# Fix lint issues automatically
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Run all checks
npm run pre-commit
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type unless absolutely necessary
- Use enums for fixed sets of values

### React Components

- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep components small and focused (single responsibility)
- Use proper TypeScript types for props
- Add JSDoc comments for public APIs

### Naming Conventions

- Components: PascalCase (e.g., `JobCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useJobsData.ts`)
- Utilities: camelCase (e.g., `errorHandler.ts`)
- Types/Interfaces: PascalCase (e.g., `UserConnection`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)

### File Organization

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── __tests__/      # Test files
```

### Commenting

- Add JSDoc comments for functions, hooks, and components
- Explain "why" not "what" in inline comments
- Keep comments up-to-date with code changes

Example:
```typescript
/**
 * Fetches job listings with automatic retry logic
 * 
 * @param selectedRoles - Array of selected job categories
 * @param hasConnections - Whether user has imported connections
 * @returns Job data state and methods
 * 
 * @example
 * const { jobs, loading, fetchJobs } = useJobsData({
 *   selectedRoles: ['Software Engineering'],
 *   hasConnections: true
 * });
 */
```

## Testing

### Writing Tests

- Write unit tests for all utilities and hooks
- Write component tests for complex components
- Aim for >80% code coverage
- Test edge cases and error scenarios

### Test File Naming

- Place test files in `__tests__` directories
- Name test files: `filename.test.ts` or `filename.test.tsx`

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('method or feature', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(connections): add LinkedIn connection import feature

fix(job-card): correct date formatting for recent posts

docs(readme): update installation instructions

test(utils): add tests for error handler
```

## Pull Request Process

1. **Update your branch** with the latest changes from main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure all tests pass**:
   ```bash
   npm run pre-commit
   npm test
   ```

3. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure CI checks pass

5. **Respond to feedback**:
   - Address reviewer comments
   - Make requested changes
   - Push updates to your branch

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console warnings or errors
- [ ] Accessibility considerations addressed

## Areas for Contribution

### High Priority

- Bug fixes and error handling improvements
- Performance optimizations
- Accessibility enhancements
- Test coverage improvements
- Documentation updates

### Feature Ideas

- Enhanced connection matching algorithms
- Additional job board integrations
- Advanced filtering and search
- Mobile responsiveness improvements
- Data export functionality

### Nice to Have

- Dark mode support
- Internationalization (i18n)
- Browser extension
- Chrome/Firefox extension

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Tag issues appropriately (`bug`, `feature`, `help wanted`, etc.)

## License

By contributing to Right2, you agree that your contributions will be licensed under the project's license.

## Thank You!

Your contributions make Right2 better for everyone. We appreciate your time and effort!
