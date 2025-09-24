#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from './jira-client.js';
import { createProjectTools, handleProjectTool } from './tools/projects.js';
import { createIssueTools, handleIssueTool } from './tools/issues.js';
import { createCommentTools, handleCommentTool } from './tools/comments.js';
import { createTransitionTools, handleTransitionTool } from './tools/transitions.js';
import { createAssignmentTools, handleAssignmentTool } from './tools/assignments.js';

class JiraMCPServer {
  private server: Server;
  private jiraClient: JiraClient;

  constructor() {
    this.server = new Server(
      {
        name: 'jira-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.jiraClient = new JiraClient();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const projectTools = createProjectTools(this.jiraClient);
      const issueTools = createIssueTools(this.jiraClient);
      const commentTools = createCommentTools(this.jiraClient);
      const transitionTools = createTransitionTools(this.jiraClient);
      const assignmentTools = createAssignmentTools(this.jiraClient);

      return {
        tools: [
          ...projectTools,
          ...issueTools,
          ...commentTools,
          ...transitionTools,
          ...assignmentTools,
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Route to appropriate tool handler
        if (name.startsWith('get_projects') || name.startsWith('get_issue_types')) {
          return await handleProjectTool(name, args || {}, this.jiraClient);
        } else if (
          name.startsWith('create_issue') ||
          name.startsWith('get_issue') ||
          name.startsWith('update_issue') ||
          name.startsWith('delete_issue')
        ) {
          return await handleIssueTool(name, args || {}, this.jiraClient);
        } else if (
          name.startsWith('create_comment') ||
          name.startsWith('get_comments') ||
          name.startsWith('update_comment') ||
          name.startsWith('delete_comment')
        ) {
          return await handleCommentTool(name, args || {}, this.jiraClient);
        } else if (
          name.startsWith('get_transitions') ||
          name.startsWith('transition_issue')
        ) {
          return await handleTransitionTool(name, args || {}, this.jiraClient);
        } else if (
          name.startsWith('assign_issue') ||
          name.startsWith('get_users') ||
          name.startsWith('get_current_user')
        ) {
          return await handleAssignmentTool(name, args || {}, this.jiraClient);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Jira MCP Server running on stdio');
  }
}

// Start the server
const server = new JiraMCPServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
