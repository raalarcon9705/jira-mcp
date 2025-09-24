import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import {
  assignIssueSchema,
  getUsersSchema,
} from '../schemas/index.js';


export function createAssignmentTools(_jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'assign_issue',
      description: 'Assign a Jira issue to a user',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'The issue key to assign',
          },
          assignee: {
            type: 'string',
            description: 'The account ID of the user to assign to',
          },
        },
        required: ['issueKey', 'assignee'],
      },
    },
    {
      name: 'get_users',
      description: 'Search for users in Jira',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for user name or email',
          },
          projectKey: {
            type: 'string',
            description: 'Filter users by project access',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of users to return (1-100)',
            default: 50,
          },
        },
      },
    },
    {
      name: 'get_current_user',
      description: 'Get information about the current authenticated user',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

export async function handleAssignmentTool(
  name: string,
  args: Record<string, unknown>,
  jiraClient: JiraClient
) {
  switch (name) {
    case 'assign_issue': {
      const validatedArgs = await assignIssueSchema.validate(args);
      const _result = await jiraClient.assignIssue(validatedArgs);
      return {
        content: [
          {
            type: 'text',
            text: `Issue ${validatedArgs.issueKey} assigned successfully`,
          },
        ],
      };
    }

    case 'get_users': {
      const validatedArgs = await getUsersSchema.validate(args);
      const users = await jiraClient.getUsers(validatedArgs);

      // Extract essential fields, improve syntax
      const essentialUsers = users.map((user) => ({
        id: user.accountId, // Shorter field name
        name: user.displayName, // Shorter field name
        email: user.emailAddress, // Shorter field name
        active: user.active,
        type: user.accountType // Shorter field name
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialUsers, null, 2),
          },
        ],
      };
    }

    case 'get_current_user': {
      const user = await jiraClient.getCurrentUser();

      // Extract essential fields, improve syntax
      const userData = user;
      const essentialUser = {
        id: userData.accountId, // Shorter field name
        name: userData.displayName, // Shorter field name
        email: userData.emailAddress, // Shorter field name
        active: userData.active,
        timezone: userData.timeZone, // Shorter field name
        type: userData.accountType // Shorter field name
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialUser, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown assignment tool: ${name}`);
  }
}
