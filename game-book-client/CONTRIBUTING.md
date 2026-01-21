# Contributing to Game Book Client

Thank you for considering contributing to Game Book Client! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yuktiflow/game-book-client.git
   cd game-book-client
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/yuktiflow/game-book-client.git
   ```

## 📝 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add customer export to Excel functionality"
```

**Commit Message Format:**
```
<type>: <description>

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add WhatsApp sharing with image attachment"
git commit -m "fix: resolve clipboard API issue in WhatsApp share"
git commit -m "docs: update README with new features"
git commit -m "refactor: optimize receipt calculation logic"
```

### 4. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template with:
   - Description of changes
   - Related issues
   - Screenshots (if applicable)
   - Testing done

## 🧪 Testing

Before submitting a PR:

1. **Run the linter**:
   ```bash
   npm run lint
   ```

2. **Test locally**:
   ```bash
   npm run dev
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Test the production build**:
   ```bash
   npm run preview
   ```

## 📋 Code Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Use arrow functions for components
- Destructure props
- Keep components small and focused
- Use meaningful variable names
- Add PropTypes or TypeScript types when possible

**Example:**
```jsx
const ReceiptForm = ({ businessName, onSubmit }) => {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = () => {
    // Logic here
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Keep custom CSS minimal
- Use consistent spacing
- Follow mobile-first approach

### File Organization

- One component per file
- Place related components in the same directory
- Use index files for cleaner imports
- Keep utility functions in separate files

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**:
   - Browser and version
   - OS
   - Node.js version

## 💡 Feature Requests

When requesting features:

1. **Description**: Clear description of the feature
2. **Use Case**: Why is this feature needed?
3. **Proposed Solution**: How should it work?
4. **Alternatives**: Any alternative solutions?

## 🔄 Syncing Your Fork

Keep your fork up to date with the main repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## ✅ Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows project style guidelines
- [ ] Code has been tested locally
- [ ] Linter passes without errors
- [ ] Build succeeds
- [ ] Commit messages are clear and descriptive
- [ ] PR description is complete
- [ ] Related issues are linked
- [ ] Screenshots added (if UI changes)

## 📦 Version Bump and Changelog

**Important**: The version bump and changelog update are handled automatically by GitHub Actions when you push to the `main` branch.

- Version is automatically incremented (patch version)
- CHANGELOG.md is updated with your commit message
- A git tag is created

**You don't need to manually update:**
- `package.json` version
- `CHANGELOG.md`

Just write good commit messages!

## 🤝 Code Review Process

1. All PRs require review before merging
2. Address review comments promptly
3. Keep PRs focused and reasonably sized
4. Be respectful and constructive in discussions

## 📞 Need Help?

- Open an issue for questions
- Check existing issues and PRs
- Reach out to maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
