# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2025-09-29

### Changed

- **Token Optimization**: Optimized `get_issue` response to minimize token usage
  - Simplified parent issue information to only include `id` and `key` fields
  - Simplified subtasks to only include `id` and `key` fields
  - Reduced response size significantly while maintaining essential information
  - Improved performance for issues with complex parent-child relationships

### Technical Improvements

- **Response Structure**: Streamlined issue data structure for better efficiency
- **Token Usage**: Significant reduction in token consumption for issue retrieval
- **Performance**: Faster response times due to reduced data processing

## [1.0.6] - 2025-09-28

### Added

- **Wiki Tool Integration**: Complete Confluence integration for accessing wiki documentation
  - New `query_wiki` tool for accessing Confluence pages by URL identifier (e.g., F4CjNw)
  - Automatic redirect following to extract page ID from short URLs
  - HTML to plain text conversion preserving line breaks and document structure
  - Markdown-formatted responses with page metadata and hierarchy display
  - Comprehensive error handling with categorized error types for better debugging
- **Enhanced Comments Pagination**: Improved pagination support for comment retrieval
  - Detailed pagination metadata including total count, current position, and navigation helpers
  - Support for `startAt` and `maxResults` parameters with validation
  - Enhanced comment data with `updated` and `visibility` fields
  - Better navigation with `hasNextPage`, `hasPreviousPage`, `nextStartAt`, and `previousStartAt`

### Changed

- **Standardized Error Handling**: Consistent error handling across all tools (comments, issues, wiki)
  - Categorized error messages for better debugging and user experience
  - Structured error responses with `isError` flag and descriptive messages
  - Authentication, permission, network, and server error categorization

### Technical Improvements

- **MCP Server Integration**: Full integration of wiki tools with existing MCP server
- **Dependency Management**: Added `confluence.js` dependency for Confluence API access
- **Type Safety**: Improved TypeScript types and removed `any` type usage
- **Response Format**: Restructured wiki responses using Markdown instead of JSON.stringify for better readability

## [1.0.5] - 2025-09-25

### Added

- **Mention Support**: Full support for user mentions in comments and issue descriptions
  - New mention syntax: `@[accountId:displayName]` for precise user targeting
  - Automatic conversion of mentions to ADF mention nodes with proper notifications
  - Integration with `get_users` tool to obtain account IDs
  - Support for mentions in all Markdown contexts (headings, paragraphs, lists, blockquotes)
  - Smart mention processing that preserves formatting and ignores mentions in code blocks
- **Enhanced Markdown Processing**: Improved Markdown to ADF conversion with mention support
  - Recursive ADF node processing for mentions after initial Markdown conversion
  - Proper handling of nested formatting (bold + italic + strikethrough combinations)
  - Code block and inline code protection (mentions remain as plain text)
  - Support for complex formatting combinations with mentions
- **Comprehensive Testing**: Jest test suite for mention functionality
  - Test cases for mention detection and processing
  - Tests for mentions in different contexts (normal text, code blocks, inline code)
  - Combined formatting tests with mentions
  - TypeScript interfaces for better test type safety

### Changed

- **Tool Descriptions**: Updated all tool descriptions to include mention format information
  - `create_issue`, `update_issue`: Added mention format guidance in description field
  - `create_comment`, `update_comment`: Enhanced descriptions with mention syntax and examples
  - Clear instructions on using `get_users` tool to obtain account IDs
  - Generic descriptions without personal data for better reusability
- **Comment API Enhancement**: Enhanced comment retrieval with full ADF content
  - `get_comments` now returns complete ADF body alongside extracted text
  - Better field naming for improved readability
  - Full ADF structure preservation for rich content display

### Fixed

- **Markdown Parser**: Fixed nested formatting issues in Markdown to ADF conversion
  - Proper handling of combined formatting (bold + italic + strikethrough)
  - Recursive processing of nested tokens in Markdown parser
  - Correct application of multiple marks to text nodes
- **Mention Processing**: Fixed mention conversion in various contexts
  - Mentions in code blocks and inline code are correctly ignored
  - Mentions in normal text are properly converted to ADF mention nodes
  - Consistent mention processing across all ADF node types

## [1.0.3] - 2025-09-24

### Added

- **Markdown to ADF Conversion**: Automatic conversion of Markdown to Atlassian Document Format (ADF)
  - New utility `markdownToADF()` for converting Markdown text to ADF format
  - Support for all major Markdown elements: headers, lists, code blocks, links, bold, italic, blockquotes
  - Automatic detection of Markdown syntax in descriptions and comments
  - Enhanced issue descriptions and comments with rich formatting support
  - Seamless integration with existing ADF and plain text support

### Changed

- **Comment API Simplification**: Comments now only accept plain text or Markdown
  - Removed direct ADF JSON support from comment creation and updates
  - All comment text is automatically converted to ADF format internally
  - Simplified API: users only need to provide strings (plain text or Markdown)
  - Updated tool descriptions to reflect the new simplified interface
  - Updated Jira client to handle the new ADF conversion flow
  - Fixed schema validation to use `cast()` instead of `validate()` for proper transformation

### Technical Improvements

- **Enhanced Markdown Parser**: Improved conversion accuracy and error handling
- **Schema Validation Updates**: Better handling of string to ADF transformations
- **Client Integration**: Streamlined ADF handling in Jira client methods
- **Error Handling**: Improved error messages and fallback mechanisms

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
