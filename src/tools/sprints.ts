import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import {
  getSprintsSchema,
  moveIssueToSprintSchema,
  getSprintIssuesSchema,
  deleteSprintSchema,
  createSprintSchema,
  updateSprintSchema,
  closeSprintSchema,
} from '../schemas/index.js';

export function createSprintTools(_jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'get_sprints',
      description: 'Get all sprints for a specific board. Returns sprint information including ID, name, state, and dates.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: {
            type: 'number',
            description: 'The ID of the board to get sprints from. Use get_agile_boards to find available board IDs.',
          },
          state: {
            type: 'string',
            enum: ['active', 'closed', 'future'],
            description: 'Filter sprints by state: "active" for current sprint, "closed" for completed sprints, "future" for upcoming sprints.',
          },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'move_issue_to_sprint',
      description: 'Move an issue to a specific sprint. This is the main function to add tickets to the current sprint.',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., "PROJ-123") to move to the sprint.',
          },
          sprintId: {
            type: 'number',
            description: 'The ID of the sprint to move the issue to. Use get_sprints to find available sprint IDs.',
          },
        },
        required: ['issueKey', 'sprintId'],
      },
    },
    {
      name: 'get_sprint_issues',
      description: 'Get all issues in a specific sprint. Useful for viewing what tickets are currently in a sprint.',
      inputSchema: {
        type: 'object',
        properties: {
          sprintId: {
            type: 'number',
            description: 'The ID of the sprint to get issues from. Use get_sprints to find available sprint IDs.',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of issues to return (1-100). Defaults to 50.',
            default: 50,
          },
        },
        required: ['sprintId'],
      },
    },
    {
      name: 'get_agile_boards',
      description: 'Get all agile boards available in the Jira instance. Required to find board IDs for sprint operations.',
      inputSchema: {
        type: 'object',
        properties: {
          projectKey: {
            type: 'string',
            description: 'Optional project key to filter boards by project.',
          },
          boardType: {
            type: 'string',
            enum: ['scrum', 'kanban'],
            description: 'Filter boards by type: "scrum" for Scrum boards, "kanban" for Kanban boards.',
          },
        },
      },
    },
    {
      name: 'delete_sprint',
      description: 'Delete a sprint. Once deleted, all open issues in the sprint will be moved to the backlog. This action is irreversible.',
      inputSchema: {
        type: 'object',
        properties: {
          sprintId: {
            type: 'number',
            description: 'ID of the sprint to delete.',
          },
        },
        required: ['sprintId'],
      },
    },
    {
      name: 'create_sprint',
      description: 'Create a new sprint. Sprint name and origin board ID are required. Start date, end date, and goal are optional.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the sprint to create.',
          },
          originBoardId: {
            type: 'number',
            description: 'ID of the board where the sprint will be created.',
          },
          startDate: {
            type: 'string',
            description: 'Start date of the sprint (ISO 8601 format).',
          },
          endDate: {
            type: 'string',
            description: 'End date of the sprint (ISO 8601 format).',
          },
          goal: {
            type: 'string',
            description: 'Goal or objective of the sprint.',
          },
        },
        required: ['name', 'originBoardId'],
      },
    },
    {
      name: 'update_sprint',
      description: 'Update sprint information (name, dates, goal, state). Only provided fields will be updated. For closed sprints, only name and goal can be updated.',
      inputSchema: {
        type: 'object',
        properties: {
          sprintId: {
            type: 'number',
            description: 'ID of the sprint to update.',
          },
          name: {
            type: 'string',
            description: 'New name for the sprint.',
          },
          startDate: {
            type: 'string',
            description: 'New start date (ISO 8601 format).',
          },
          endDate: {
            type: 'string',
            description: 'New end date (ISO 8601 format).',
          },
          goal: {
            type: 'string',
            description: 'New goal or objective for the sprint.',
          },
          state: {
            type: 'string',
            enum: ['future', 'active', 'closed'],
            description: 'New state: "future" for upcoming, "active" to start, "closed" to complete.',
          },
        },
        required: ['sprintId'],
      },
    },
    {
      name: 'close_sprint',
      description: 'Close and complete a sprint. This action requires the sprint to be in the "active" state. Once closed, the sprint cannot be reopened.',
      inputSchema: {
        type: 'object',
        properties: {
          sprintId: {
            type: 'number',
            description: 'ID of the sprint to close.',
          },
        },
        required: ['sprintId'],
      },
    },
  ];
}

export async function handleSprintTool(
  name: string,
  args: Record<string, unknown>,
  jiraClient: JiraClient
) {
  switch (name) {
    case 'get_sprints': {
      const validatedArgs = await getSprintsSchema.validate(args);
      const sprints = await jiraClient.getSprints(validatedArgs);

      // Extract only essential fields to reduce token usage
      const essentialSprints = sprints.values?.map((sprint) => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal
      })) || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialSprints, null, 2),
          },
        ],
      };
    }
    case 'move_issue_to_sprint': {
      const validatedArgs = await moveIssueToSprintSchema.validate(args);
      const _result = await jiraClient.moveIssueToSprint(validatedArgs);

      return {
        content: [
          {
            type: 'text',
            text: `Issue ${validatedArgs.issueKey} moved to sprint ${validatedArgs.sprintId} successfully`,
          },
        ],
      };
    }
    case 'get_sprint_issues': {
      const validatedArgs = await getSprintIssuesSchema.validate(args);
      const issues = await jiraClient.getSprintIssues(validatedArgs);

      // Extract only essential fields to reduce token usage
      const essentialIssues = issues.issues?.map((issue) => ({
        key: issue.key,
        summary: issue.fields?.summary || 'No summary',
        status: issue.fields?.status?.name || 'Unknown',
        assignee: issue.fields?.assignee?.displayName || 'Unassigned',
        priority: issue.fields?.priority?.name || 'None'
      })) || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialIssues, null, 2),
          },
        ],
      };
    }
    case 'get_agile_boards': {
      const boards = await jiraClient.getAgileBoards(args);

      // Extract only essential fields to reduce token usage
      const essentialBoards = boards.values?.map((board) => ({
        id: board.id,
        name: board.name,
        type: board.type,
        projectKey: board.location?.projectKey,
        projectName: board.location?.projectName
      })) || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialBoards, null, 2),
          },
        ],
      };
    }
    case 'delete_sprint': {
      const validatedArgs = await deleteSprintSchema.validate(args);
      const _result = await jiraClient.deleteSprint(validatedArgs);

      return {
        content: [
          {
            type: 'text',
            text: `Sprint ${validatedArgs.sprintId} deleted successfully. All open issues moved to backlog.`,
          },
        ],
      };
    }
    case 'create_sprint': {
      const validatedArgs = await createSprintSchema.validate(args);
      const result = await jiraClient.createSprint(validatedArgs);

      // Extract only essential fields
      const essentialSprint = {
        id: result.id,
        name: result.name,
        state: result.state,
        goal: result.goal
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialSprint, null, 2),
          },
        ],
      };
    }
    case 'update_sprint': {
      const validatedArgs = await updateSprintSchema.validate(args);
      const _result = await jiraClient.updateSprint(validatedArgs);

      return {
        content: [
          {
            type: 'text',
            text: `Sprint ${validatedArgs.sprintId} updated successfully`,
          },
        ],
      };
    }
    case 'close_sprint': {
      const validatedArgs = await closeSprintSchema.validate(args);
      const _result = await jiraClient.closeSprint(validatedArgs);

      return {
        content: [
          {
            type: 'text',
            text: `Sprint ${validatedArgs.sprintId} closed successfully`,
          },
        ],
      };
    }
    default:
      throw new Error(`Unknown sprint tool: ${name}`);
  }
}
