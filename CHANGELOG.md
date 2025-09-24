# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-09-24

### Added
- **Complete Sprint Management System**: Full agile sprint lifecycle management
  - `get_agile_boards` - Get all agile boards available in Jira instance
  - `get_sprints` - Get all sprints for a specific board with filtering by state
  - `create_sprint` - Create new sprints with optional dates and goals
  - `update_sprint` - Update sprint information (name, dates, goal, state)
  - `close_sprint` - Close and complete active sprints
  - `delete_sprint` - Delete sprints (moves issues to backlog)
  - `move_issue_to_sprint` - Move issues to specific sprints
  - `get_sprint_issues` - Get all issues within a sprint
- **Enhanced Documentation**: Updated README.md with complete sprint management documentation
- **Improved Project Structure**: Added `sprints.ts` tool module

### Changed
- **Total Tools**: Increased from 15 to 23 tools (53% increase)
- **Competitive Position**: Now includes complete sprint management capabilities
- **Documentation**: Comprehensive sprint management examples and usage guides

### Technical Details
- **Agile API Integration**: Full integration with Jira's Agile API using `AgileClient`
- **Response Optimization**: Token-efficient responses for all sprint operations
- **Type Safety**: Complete TypeScript support for all sprint operations
- **Validation**: Yup schema validation for all sprint tool inputs
- **Error Handling**: Robust error handling with descriptive messages

### Breaking Changes
- None

### Migration Guide
- No migration required - all existing functionality remains unchanged
- New sprint management tools are additive and optional

## [1.0.1] - 2025-09-2240

### Added
- Initial release with core Jira functionality
- Project management tools
- Issue CRUD operations
- Comment management system
- Transition management
- User assignment capabilities
- Complete TypeScript support
- Token-optimized responses

### Technical Details
- 15 core tools implemented
- Full Jira Cloud support
- ADF support for rich comments
- Yup schema validation
- Professional documentation

## [1.0.0] - 2025-09-24

### Added
- Initial project setup
- Basic MCP server structure
- Core dependencies and configuration

---

**Legend:**
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
