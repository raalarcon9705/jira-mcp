import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import {
  createIssueSchema,
  updateIssueSchema,
  getIssueSchema,
  deleteIssueSchema,
} from '../schemas/index.js';

export function createIssueTools(jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'create_issue',
      description: 'Create a new Jira issue (Bug, Story, Task, Epic, etc.). Returns the created issue key, ID, and URL. Use get_issue_types to find valid issueType values for the project.',
      inputSchema: {
        type: 'object',
        properties: {
          projectKey: {
            type: 'string',
            description: 'Project key (e.g., "PROJ") where the issue will be created. Use get_projects to find available keys.',
          },
          summary: {
            type: 'string',
            description: 'Issue title/summary (max 255 characters). This is the main identifier shown in issue lists.',
          },
          description: {
            type: 'string',
            description: 'Detailed issue description. Supports plain text or Atlassian Document Format (ADF) for rich formatting.',
          },
          issueType: {
            type: 'string',
            description: 'Issue type name (e.g., "Bug", "Story", "Task", "Epic"). Use get_issue_types to find valid values.',
          },
          priority: {
            type: 'string',
            description: 'Priority level: "Highest", "High", "Medium", "Low", "Lowest". Defaults to project default if not specified.',
          },
          assignee: {
            type: 'string',
            description: 'Account ID of the user to assign the issue to. Use get_users to find account IDs.',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of label names for categorization and filtering (e.g., ["bug", "urgent", "frontend"]).',
          },
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of component names that this issue affects (e.g., ["API", "Database", "UI"]).',
          },
          fixVersions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of version names where this issue will be fixed (e.g., ["v1.2", "v2.0"]).',
          },
          customFields: {
            type: 'object',
            description: 'Custom field values as key-value pairs. Field keys are project-specific.',
          },
        },
        required: ['projectKey', 'summary', 'issueType'],
      },
    },
    {
      name: 'get_issue',
      description: 'Retrieve detailed information about a specific Jira issue including status, assignee, description, comments, and workflow data. Use this to get current state before making updates.',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., "PROJ-123") or numeric issue ID. This is the unique identifier for the issue.',
          },
          expand: {
            type: 'string',
            description: 'Comma-separated list of additional data: renderedFields,names,schema,transitions,operations,editmeta,changelog',
          },
          fields: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific fields to return (e.g., ["summary", "status", "assignee"]). If not specified, returns all fields.',
          },
        },
        required: ['issueKey'],
      },
    },
    {
      name: 'update_issue',
      description: 'Update fields of an existing Jira issue. Only provided fields will be updated. Use get_issue first to see current values. Returns success confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., "PROJ-123") to update. This is the unique identifier for the issue.',
          },
          summary: {
            type: 'string',
            description: 'New issue title/summary (max 255 characters). Replaces the existing summary.',
          },
          description: {
            type: 'string',
            description: 'New issue description. Replaces the existing description. Supports plain text or ADF.',
          },
          priority: {
            type: 'string',
            description: 'New priority: "Highest", "High", "Medium", "Low", "Lowest". Replaces current priority.',
          },
          assignee: {
            type: 'string',
            description: 'Account ID of new assignee. Use get_users to find account IDs. Set to null to unassign.',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Complete array of labels (replaces all existing labels). Use empty array to remove all labels.',
          },
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'Complete array of components (replaces all existing components). Use empty array to remove all components.',
          },
          fixVersions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Complete array of fix versions (replaces all existing versions). Use empty array to remove all versions.',
          },
          customFields: {
            type: 'object',
            description: 'Custom field values as key-value pairs. Only specified fields will be updated.',
          },
        },
        required: ['issueKey'],
      },
    },
    {
      name: 'delete_issue',
      description: 'Permanently delete a Jira issue. This action cannot be undone. Use with caution. Returns success confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., "PROJ-123") to delete. This is the unique identifier for the issue.',
          },
          deleteSubtasks: {
            type: 'boolean',
            description: 'Whether to also delete all subtasks of this issue. Defaults to false (subtasks will remain).',
            default: false,
          },
        },
        required: ['issueKey'],
      },
    },
  ];
}

export async function handleIssueTool(
  name: string,
  args: any,
  jiraClient: JiraClient
): Promise<any> {
  switch (name) {
    case 'create_issue': {
      const validatedArgs = await createIssueSchema.validate(args);
      const issue = await jiraClient.createIssue(validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: `Issue ${issue.key} created successfully`,
          },
        ],
      };
    }

    case 'get_issue': {
      const validatedArgs = await getIssueSchema.validate(args);
      const issue = await jiraClient.getIssue(validatedArgs);
      
      // Remove custom fields to reduce token usage
      const cleanIssue = JSON.parse(JSON.stringify(issue, (key, value) => {
        if (key.startsWith('customfield_')) {
          return undefined; // Remove custom fields
        }
        return value;
      }));
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cleanIssue, null, 2),
          },
        ],
      };
    }

    case 'update_issue': {
      const validatedArgs = await updateIssueSchema.validate(args);
      const result = await jiraClient.updateIssue(validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: `Issue ${validatedArgs.issueKey} updated successfully`,
          },
        ],
      };
    }

    case 'delete_issue': {
      const validatedArgs = await deleteIssueSchema.validate(args);
      const result = await jiraClient.deleteIssue(validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: `Issue ${validatedArgs.issueKey} deleted successfully`,
          },
        ],
      };
    }


    default:
      throw new Error(`Unknown issue tool: ${name}`);
  }
}
