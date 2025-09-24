# Contributing to Jira MCP Server

Thank you for your interest in contributing to the Jira MCP Server! 🚀

This project is open source and we value all contributions, from reporting bugs to implementing new features.

## 🚀 How to Contribute

### Reporting Bugs

If you find a bug, please:

1. **Check that it's not already reported** in [Issues](https://github.com/raalarcon9705/jira-mcp/issues)
2. **Create a new issue** with the `bug` label
3. **Include detailed information**:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Server version and environment
   - Relevant logs (without sensitive information)

### Requesting Features

For new features:

1. **Check that it's not already requested** in [Issues](https://github.com/raalarcon9705/jira-mcp/issues)
2. **Create a new issue** with the `enhancement` label
3. **Describe clearly**:
   - What functionality you need
   - Why it would be useful
   - Specific use cases
   - Possible implementation (if you have ideas)

### Contributing Code

#### Environment Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/jira-mcp.git
   cd jira-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Code Standards

- **TypeScript**: All code must be in TypeScript
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use automatic formatting
- **Tests**: Add tests for new features
- **Documentation**: Update documentation when necessary

#### Development Process

1. **Develop your feature**:
   ```bash
   npm run dev  # For development
   npm run build  # To compile
   ```

2. **Test your code**:
   ```bash
   npm test  # Run tests
   npm run lint  # Check linting
   ```

3. **Use MCP Inspector** to test:
   ```bash
   npx @modelcontextprotocol/inspector
   # Configure: command: "node", args: ["dist/index.js"]
   ```

#### Project Structure

```
src/
├── index.ts              # Main MCP server
├── jira-client.ts        # Jira API client
├── cli.ts               # CLI for npx
├── schemas/
│   └── index.ts          # Yup validation schemas
└── tools/
    ├── projects.ts       # Project tools
    ├── issues.ts         # Issue tools
    ├── comments.ts       # Comment tools
    ├── transitions.ts    # Transition tools
    └── assignments.ts    # Assignment tools
```

#### Adding New Features

1. **Create validation schema** in `src/schemas/index.ts`
2. **Implement method** in `src/jira-client.ts`
3. **Create MCP tool** in appropriate file in `src/tools/`
4. **Register tool** in `src/index.ts`
5. **Optimize response** for token efficiency

#### Example MCP Tool

```typescript
{
  name: 'new_tool',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      parameter: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['parameter']
  }
}
```

### Pull Request Process

1. **Ensure your code**:
   - Compiles without errors
   - Passes all tests
   - Follows code standards
   - Includes updated documentation

2. **Create the Pull Request**:
   - Descriptive title
   - Detailed description of changes
   - Reference to related issues
   - Screenshots if applicable

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass
   - [ ] Functionality tested manually
   - [ ] Response optimization verified

   ## Checklist
   - [ ] Code follows project standards
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No personal data included
   ```

### Code Review

- **Maintainers will review** your code
- **Respond to feedback** constructively
- **Make requested changes** and update the PR
- **PR will be merged** once approved

## 🏷️ Issue Labels

- `bug`: Something doesn't work as expected
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Good for new contributors
- `help wanted`: Extra help needed
- `question`: Question or discussion

## 📋 Development Guidelines

### Response Optimization

- **Essential fields**: Return only necessary fields
- **Short names**: Use abbreviated names (e.g., `desc` instead of `description`)
- **Filter custom fields**: Remove `customfield_*` from issue responses
- **Consistent format**: Maintain uniform structure

### Error Handling

- **Descriptive messages**: Include context in error messages
- **Appropriate error types**: Use correct error types
- **Logging**: Add `console.error` for debugging
- **User-friendly**: Make errors understandable for end users

### Documentation

- **Update README**: Add new tools to documentation
- **Include examples**: Provide usage examples
- **Response format**: Document response structure
- **No personal data**: Use only generic examples

## 🤝 Code of Conduct

- **Be respectful** and constructive in discussions
- **Help others** learn and contribute
- **Follow the code of conduct** of the project
- **Ask questions** if you need help

## 🆘 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general help
- **Documentation**: Check existing documentation first
- **Code examples**: Look at existing implementations

## 🎉 Recognition

All contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors

Thank you for making this project better! 🌟

---

**Note**: This project is designed to work with Jira Cloud. For Jira Server/Data Center, additional modifications are required for authentication and some endpoints.