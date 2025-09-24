# Jira MCP Server

[![npm version](https://badge.fury.io/js/raalarcon-jira-mcp-server.svg)](https://badge.fury.io/js/raalarcon-jira-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)
[![CI/CD](https://github.com/raalarcon9705/jira-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/raalarcon9705/jira-mcp/actions/workflows/ci.yml)

A complete **open source** MCP (Model Context Protocol) server for integrating Jira/Atlassian with AI applications. This server provides all main Jira dashboard functionalities through a unified API with optimized responses for token efficiency.

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/github/contributors/raalarcon9705/jira-mcp.svg)](https://github.com/raalarcon9705/jira-mcp/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/raalarcon9705/jira-mcp.svg)](https://github.com/raalarcon9705/jira-mcp/stargazers)

## Features

- ✅ **Project Management**: List projects and issue types
- ✅ **Issue CRUD**: Create, read, update and delete issues
- ✅ **Comments**: Create, read, update and delete comments
- ✅ **Transitions**: Move issues between states
- ✅ **Assignments**: Assign issues to users
- ✅ **User Management**: Search and manage users
- ✅ **Validation**: Yup schema validation
- ✅ **Authentication**: Full Jira Cloud support
- ✅ **Optimized Responses**: Token-efficient field filtering
- ✅ **Type Safety**: Full TypeScript support

## Installation

### Option 1: Using npx (Recommended)

The easiest way to use this MCP server is with `npx`:

1. **Configure your MCP client** (e.g., Claude Desktop) with this configuration:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "raalarcon-jira-mcp-server"],
      "env": {
        "JIRA_HOST": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

2. **Get your Jira API token** (see instructions below)

That's it! The server will be automatically downloaded and run when needed.

### Option 2: Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/raalarcon9705/jira-mcp.git
cd jira-mcp
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the project**:
```bash
npm run build
```

4. **Configure your MCP client** with the full path to the built server:

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/full/path/to/jira-mcp/dist/index.js"],
      "env": {
        "JIRA_HOST": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Note**: Replace `/full/path/to/jira-mcp/` with the actual absolute path to your project directory.

### Getting API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a descriptive name
4. Copy the generated token

## Usage

### Using with npx (Recommended)

Once configured in your MCP client, the server will automatically start when needed. No additional setup required!

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Testing with npx

You can also test the server directly with npx:

```bash
# Test the server
npx raalarcon-jira-mcp-server

# Or use with MCP Inspector
npx @modelcontextprotocol/inspector
# Then configure: command: "npx", args: ["-y", "raalarcon-jira-mcp-server"]
```

## Available Tools

### Projects

#### `get_projects`
Retrieves all projects accessible to the authenticated user.

**Parameters**:
- `expand` (optional): Additional data to include
- `recent` (optional): Number of recent projects (0-20)

**Response**: Array of projects with essential fields:
```json
[
  {
    "key": "PROJ",
    "name": "Project Name",
    "id": "10001",
    "projectTypeKey": "software"
  }
]
```

#### `get_issue_types`
Gets all available issue types for a specific project.

**Parameters**:
- `projectKey` (required): Project key

**Response**: Array of issue types with essential fields:
```json
[
  {
    "id": "10002",
    "name": "Task",
    "desc": "A small, independent piece of work",
    "subtask": false,
    "level": 0
  }
]
```

### Issues

#### `create_issue`
Creates a new issue in Jira.

**Parameters**:
- `projectKey` (required): Project key
- `summary` (required): Issue summary
- `issueType` (required): Issue type (Bug, Story, Task, etc.)
- `description` (optional): Issue description
- `priority` (optional): Priority (Highest, High, Medium, Low, Lowest)
- `assignee` (optional): Assignee account ID
- `labels` (optional): Array of labels
- `components` (optional): Array of components
- `fixVersions` (optional): Array of fix versions
- `customFields` (optional): Custom field values

**Response**: `Issue PROJ-123 created successfully`

#### `get_issue`
Gets details of a specific issue (custom fields removed for token efficiency).

**Parameters**:
- `issueKey` (required): Issue key (e.g., PROJ-123)
- `expand` (optional): Additional information
- `fields` (optional): Specific fields to return

**Response**: Complete issue object with custom fields filtered out

#### `update_issue`
Updates an existing issue.

**Parameters**:
- `issueKey` (required): Issue key to update
- `summary` (optional): New summary
- `description` (optional): New description
- `priority` (optional): New priority
- `assignee` (optional): New assignee
- `labels` (optional): New labels
- `components` (optional): New components
- `fixVersions` (optional): New fix versions
- `customFields` (optional): Custom fields

**Response**: `Issue PROJ-123 updated successfully`

#### `delete_issue`
Deletes an issue.

**Parameters**:
- `issueKey` (required): Issue key to delete
- `deleteSubtasks` (optional): Delete subtasks too (default: false)

**Response**: `Issue PROJ-123 deleted successfully`

### Comments

#### `create_comment`
Adds a comment to an issue.

**Parameters**:
- `issueKey` (required): Issue key
- `body` (required): Comment text (supports ADF format)
- `visibility` (optional): Visibility settings

**Response**: `Comment 12345 created successfully`

#### `get_comments`
Gets all comments for an issue.

**Parameters**:
- `issueKey` (required): Issue key
- `startAt` (optional): Start index (default: 0)
- `maxResults` (optional): Max comments (1-100, default: 50)

**Response**: Optimized comment structure:
```json
{
  "total": 5,
  "start": 0,
  "max": 50,
  "items": [
    {
      "id": "12345",
      "author": "John Doe",
      "authorId": "account-id",
      "created": "2025-01-01T10:00:00.000Z",
      "text": "Comment text content"
    }
  ]
}
```

#### `update_comment`
Updates an existing comment.

**Parameters**:
- `issueKey` (required): Issue key
- `commentId` (required): Comment ID
- `body` (required): New comment text
- `visibility` (optional): New visibility settings

**Response**: `Comment 12345 updated successfully`

#### `delete_comment`
Deletes a comment.

**Parameters**:
- `issueKey` (required): Issue key
- `commentId` (required): Comment ID

**Response**: `Comment 12345 deleted successfully`

### Transitions

#### `get_transitions`
Gets available transitions for an issue.

**Parameters**:
- `issueKey` (required): Issue key

**Response**: Array of transitions with essential fields:
```json
[
  {
    "id": "21",
    "name": "In Progress",
    "desc": "The assignee is currently working on this activity",
    "toName": "In Progress",
    "toId": "3",
    "available": true,
    "category": "In Progress"
  }
]
```

#### `transition_issue`
Moves an issue to a different state.

**Parameters**:
- `issueKey` (required): Issue key
- `transitionId` (required): Transition ID
- `comment` (optional): Comment to add during transition
- `fields` (optional): Additional fields to update

**Response**: `Issue PROJ-123 transitioned successfully`

### Assignments

#### `assign_issue`
Assigns an issue to a user.

**Parameters**:
- `issueKey` (required): Issue key
- `assignee` (required): User account ID

**Response**: `Issue PROJ-123 assigned successfully`

#### `get_users`
Searches for users in Jira.

**Parameters**:
- `query` (optional): Search query by name or email
- `projectKey` (optional): Filter by project access
- `maxResults` (optional): Max users (1-100, default: 50)

**Response**: Array of users with essential fields:
```json
[
  {
    "id": "account-id",
    "name": "John Doe",
    "email": "john@example.com",
    "active": true,
    "type": "atlassian"
  }
]
```

#### `get_current_user`
Gets information about the current authenticated user.

**Response**: Current user with essential fields:
```json
{
  "id": "account-id",
  "name": "Current User",
  "email": "user@example.com",
  "active": true,
  "timezone": "America/New_York",
  "type": "atlassian"
}
```

## Response Optimization

The server is optimized for token efficiency:

- **Essential Fields Only**: Returns only necessary fields for each operation
- **Custom Fields Filtered**: Automatically removes custom fields from issue responses
- **Short Field Names**: Uses abbreviated field names (e.g., `desc` instead of `description`)
- **Success Messages**: Clear, concise success confirmations
- **Structured Data**: Consistent response formats across all tools

## Error Handling

The server includes robust error handling with descriptive messages. Common errors include:

- **Authentication**: Invalid or expired credentials
- **Permissions**: Insufficient permissions for the operation
- **Validation**: Invalid input data
- **Resources**: Issues or projects not found
- **API**: Rate limits or Jira server errors

## Development

### Project Structure

```
src/
├── index.ts              # Main MCP server
├── jira-client.ts        # Jira API client
├── schemas/
│   └── index.ts          # Yup validation schemas
└── tools/
    ├── projects.ts       # Project tools
    ├── issues.ts         # Issue tools
    ├── comments.ts       # Comment tools
    ├── transitions.ts    # Transition tools
    └── assignments.ts    # Assignment tools
```

### Adding New Features

1. **Create validation schema** in `src/schemas/index.ts`
2. **Implement method** in `src/jira-client.ts`
3. **Create MCP tool** in appropriate file in `src/tools/`
4. **Register tool** in `src/index.ts`

### Testing

#### Using MCP Inspector (Recommended)

1. **Install MCP Inspector**:
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector
   ```

4. **Configure your server** in the inspector interface:
   - **Transport**: STDIO (default)
   - **Command**: `node`
   - **Args**: `build/index.js`
   - **Environment**: Add your Jira credentials

#### Alternative Testing Methods

**CLI Mode** (for automation and scripting):
```bash
# List available tools
npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list

# Call a specific tool
npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/call --tool-name get_projects
```

**Configuration File** (for complex setups):
```json
{
  "mcpServers": {
    "jira-server": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "JIRA_HOST": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Claude Desktop**: Configure MCP servers directly in Claude Desktop for real-world testing

#### Advanced Configuration

**Environment Variables** (for advanced users):
```bash
# Jira configuration
export JIRA_HOST="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"

# Timeout settings
export MCP_SERVER_REQUEST_TIMEOUT=60000
export MCP_REQUEST_TIMEOUT_RESET_ON_PROGRESS=false

# Proxy settings (if using MCP Proxy)
export MCP_PROXY_FULL_ADDRESS=http://localhost:5577

# Auto-open browser
export MCP_AUTO_OPEN_ENABLED=true
```

**Query Parameters** (for direct testing):
```
http://localhost:6274/?transport=stdio&serverCommand=node&serverArgs=build/index.js
```

#### Manual Testing

```bash
# Build and run the server
npm run build
npm start
```

## Contributing

We welcome contributions to the Jira MCP Server! Please follow these guidelines to ensure a smooth contribution process.

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/raalarcon9705/jira-mcp.git
   cd jira-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

#### Setting Up Your Environment

1. **Install MCP Inspector** (official testing tool):
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Test with MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
   Then configure your server:
   - **Transport**: STDIO
   - **Command**: `node`
   - **Args**: `build/index.js`
   - **Environment**: Add your Jira credentials

#### Code Standards

- **TypeScript**: All code must be written in TypeScript
- **Type Safety**: Avoid `any` types, use proper Jira.js types
- **Error Handling**: Include comprehensive error handling
- **Validation**: Use Yup schemas for input validation
- **Comments**: Add clear comments for complex logic
- **Formatting**: Follow existing code style and formatting

#### Adding New Features

1. **Create validation schema** in `src/schemas/index.ts`:
   ```typescript
   export const yourFeatureSchema = yup.object({
     // Define your schema
   });
   ```

2. **Implement API method** in `src/jira-client.ts`:
   ```typescript
   async yourFeature(input: YourFeatureInput) {
     try {
       // Implementation
     } catch (error) {
       throw new Error(`Failed to your feature: ${error.message}`);
     }
   }
   ```

3. **Create MCP tool** in appropriate file in `src/tools/`:
   ```typescript
   {
     name: 'your_tool',
     description: 'Clear description of what the tool does',
     inputSchema: {
       // Define input schema
     }
   }
   ```

4. **Register tool** in `src/index.ts`:
   ```typescript
   // Add to appropriate handler
   ```

5. **Optimize response** for token efficiency:
   - Return only essential fields
   - Use short field names
   - Filter out unnecessary data

#### Testing Your Changes

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Test with MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
   - Configure server: STDIO, `node build/index.js`
   - Test all affected tools
   - Verify responses are optimized

3. **Test with CLI mode** (for automation):
   ```bash
   # List tools
   npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list
   
   # Test specific tool
   npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/call --tool-name get_projects
   ```

4. **Verify response optimization**:
   - Check that only essential fields are returned
   - Ensure field names are shortened
   - Confirm custom fields are filtered out

### Pull Request Process

#### Before Submitting

- [ ] **Code compiles** without TypeScript errors
- [ ] **All tools work** as expected
- [ ] **Response optimization** is implemented
- [ ] **Error handling** is comprehensive
- [ ] **Documentation** is updated if needed
- [ ] **No personal data** is included in examples

#### Creating a Pull Request

1. **Commit your changes** with clear messages:
   ```bash
   git add .
   git commit -m "Add new feature: brief description"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request** on GitHub with:
   - **Clear title** describing the change
   - **Detailed description** of what was added/changed
   - **Testing instructions** for reviewers
   - **Screenshots** if UI changes are involved

#### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New functionality tested
- [ ] Response optimization verified

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No personal data included
```

### Code Review Process

1. **Automated checks** will run on your PR
2. **Maintainers will review** your code
3. **Address feedback** promptly
4. **Make requested changes** and update the PR
5. **PR will be merged** once approved

### Reporting Issues

When reporting bugs or requesting features:

1. **Check existing issues** first
2. **Use the issue template** provided
3. **Include reproduction steps** for bugs
4. **Provide clear description** for feature requests
5. **Include relevant logs** and error messages

### Development Guidelines

#### Response Optimization

- **Essential fields only**: Return only necessary data
- **Short field names**: Use abbreviated names (e.g., `desc` instead of `description`)
- **Filter custom fields**: Remove `customfield_*` from issue responses
- **Consistent format**: Maintain uniform response structure

#### Error Handling

- **Descriptive messages**: Include context in error messages
- **Proper error types**: Use appropriate error types
- **Logging**: Add console.error for debugging
- **User-friendly**: Make errors understandable for end users

#### Documentation

- **Update README**: Add new tools to documentation
- **Include examples**: Provide usage examples
- **Response format**: Document response structure
- **No personal data**: Use generic examples only

### Community Guidelines

- **Be respectful** and constructive in discussions
- **Help others** learn and contribute
- **Follow the code of conduct**
- **Ask questions** if you need help

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general help
- **Documentation**: Check existing docs first
- **Code examples**: Look at existing implementations

Thank you for contributing to the Jira MCP Server! 🚀

## 🤝 Contributing

We welcome contributions from the community! This project is open source and we value all contributions.

### Quick Start for Contributors

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
5. **Make your changes** and test them
6. **Submit a pull request**

### Ways to Contribute

- 🐛 **Report bugs** using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ **Request features** using our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- 💻 **Submit code** improvements and new features
- 📚 **Improve documentation** and examples
- 🧪 **Add tests** for better coverage
- 🌍 **Translate** documentation to other languages

### Development Guidelines

- Follow our [Contributing Guide](CONTRIBUTING.md)
- Read our [Code of Conduct](CODE_OF_CONDUCT.md)
- Use TypeScript for all new code
- Add tests for new functionality
- Update documentation as needed

### Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Use GitHub Issues for bugs and feature requests
- 📖 **Documentation**: Check the README and CONTRIBUTING.md

## Publishing to npm

To publish this MCP server to npm for distribution:

1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Run the publish script**:
   ```bash
   ./publish.sh
   ```

3. **Or publish manually**:
   ```bash
   npm run build
   npm publish
   ```

The package will be available as `raalarcon-jira-mcp-server` and users can install it with:
```bash
npx raalarcon-jira-mcp-server
```

## License

ISC

## Support

To report bugs or request features, please open an issue in the repository.

---

**Note**: This MCP server is designed to work with Jira Cloud. For Jira Server/Data Center, additional modifications are required for authentication and some endpoints.