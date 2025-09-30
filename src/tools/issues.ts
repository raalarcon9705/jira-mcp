import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import {
  createIssueSchema,
  updateIssueSchema,
  getIssueSchema,
  deleteIssueSchema,
} from '../schemas/index.js';


export function createIssueTools(_jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'create_issue',
      description: 'Create a new Jira issue (Bug, Story, Task, Epic, etc.) or subtask. Returns the created issue key, ID, and URL. Use get_issue_types to find valid issueType values for the project. To create a subtask, specify the parent issue key.',
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
            description: 'Detailed issue description. Supports plain text, Markdown, or Atlassian Document Format (ADF) for rich formatting. Markdown will be automatically converted to ADF. For mentions, use format: @[accountId:displayName] (get accountId from get_users tool).',
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
          parent: {
            type: 'string',
            description: 'Issue key of the parent issue (e.g., "PROJ-123"). Required to create a subtask.',
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
      description: 'Update fields of an existing Jira issue or convert to subtask. Only provided fields will be updated. Use get_issue first to see current values. Returns success confirmation.',
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
            description: 'New issue description. Replaces the existing description. Supports plain text, Markdown, or ADF. Markdown will be automatically converted to ADF. For mentions, use format: @[accountId:displayName] (get accountId from get_users tool).',
          },
          priority: {
            type: 'string',
            description: 'New priority: "Highest", "High", "Medium", "Low", "Lowest". Replaces current priority.',
          },
          assignee: {
            type: 'string',
            description: 'Account ID of new assignee. Use get_users to find account IDs. Set to null to unassign.',
          },
          parent: {
            type: 'string',
            description: 'Issue key of the parent issue (e.g., "PROJ-123"). Use to convert issue to subtask or change parent.',
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
  args: Record<string, unknown>,
  jiraClient: JiraClient
) {
  try {
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

        // Filter and simplify the issue data
        const simplifiedIssue = {
          id: issue.id,
          key: issue.key,
          self: issue.self,
          fields: {
            summary: issue.fields.summary,
            description: issue.fields.description,
            status: {
              id: issue.fields.status?.id,
              name: issue.fields.status?.name,
              statusCategory: {
                id: issue.fields.status?.statusCategory?.id,
                key: issue.fields.status?.statusCategory?.key,
                name: issue.fields.status?.statusCategory?.name
              }
            },
            priority: {
              id: issue.fields.priority?.id,
              name: issue.fields.priority?.name
            },
            assignee: issue.fields.assignee ? {
              accountId: issue.fields.assignee.accountId,
              displayName: issue.fields.assignee.displayName,
              emailAddress: issue.fields.assignee.emailAddress
            } : null,
            reporter: issue.fields.reporter ? {
              accountId: issue.fields.reporter.accountId,
              displayName: issue.fields.reporter.displayName,
              emailAddress: issue.fields.reporter.emailAddress
            } : null,
            creator: issue.fields.creator ? {
              accountId: issue.fields.creator.accountId,
              displayName: issue.fields.creator.displayName,
              emailAddress: issue.fields.creator.emailAddress
            } : null,
            project: {
              id: issue.fields.project?.id,
              key: issue.fields.project?.key,
              name: issue.fields.project?.name
            },
            issuetype: {
              id: issue.fields.issuetype?.id,
              name: issue.fields.issuetype?.name,
              subtask: issue.fields.issuetype?.subtask
            },
            parent: issue.fields.parent ? {
              id: issue.fields.parent.id,
              key: issue.fields.parent.key
            } : null,
            subtasks: issue.fields.subtasks?.map(subtask => ({
              id: subtask.id,
              key: subtask.key
            })) || [],
            labels: issue.fields.labels || [],
            components: issue.fields.components?.map(comp => ({
              id: comp.id,
              name: comp.name
            })) || [],
            fixVersions: issue.fields.fixVersions?.map(version => ({
              id: version.id,
              name: version.name,
              released: version.released
            })) || [],
            created: issue.fields.created,
            updated: issue.fields.updated,
            duedate: issue.fields.duedate,
            resolution: issue.fields.resolution,
            resolutiondate: issue.fields.resolutiondate
          }
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(simplifiedIssue, null, 2),
            },
          ],
        };
      }

      case 'update_issue': {
        const validatedArgs = await updateIssueSchema.validate(args);
        const _result = await jiraClient.updateIssue(validatedArgs);

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
        const _result = await jiraClient.deleteIssue(validatedArgs);

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error in issue operation: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
