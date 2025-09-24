import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import {
  getTransitionsSchema,
  transitionIssueSchema,
} from '../schemas/index.js';


export function createTransitionTools(_jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'get_transitions',
      description: 'Get available transitions for a Jira issue',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'The issue key to get transitions for',
          },
        },
        required: ['issueKey'],
      },
    },
    {
      name: 'transition_issue',
      description: 'Move a Jira issue to a different status/state',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'The issue key to transition',
          },
          transitionId: {
            type: 'number',
            description: 'The ID of the transition to perform (will be converted to string automatically)',
          },
          comment: {
            type: 'string',
            description: 'Optional comment to add during transition',
          },
          fields: {
            type: 'object',
            description: 'Additional fields to update during transition',
          },
        },
        required: ['issueKey', 'transitionId'],
      },
    },
  ];
}

export async function handleTransitionTool(
  name: string,
  args: Record<string, unknown>,
  jiraClient: JiraClient
) {
  switch (name) {
    case 'get_transitions': {
      const validatedArgs = await getTransitionsSchema.validate(args);
      const transitions = await jiraClient.getTransitions(validatedArgs);

      // Extract essential fields, add description, improve syntax
      const transitionsData = transitions;
      const essentialTransitions = transitionsData.transitions?.map((transition) => ({
        id: transition.id,
        name: transition.name,
        desc: transition.to?.description, // Add description
        toName: transition.to?.name, // Shorter field name
        toId: transition.to?.id,
        available: transition.isAvailable,
        category: transition.to?.statusCategory?.name // Shorter field name
      })) || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialTransitions, null, 2),
          },
        ],
      };
    }

    case 'transition_issue': {
      const validatedArgs = await transitionIssueSchema.validate(args);
      const _result = await jiraClient.transitionIssue(validatedArgs);
      return {
        content: [
          {
            type: 'text',
            text: `Issue ${validatedArgs.issueKey} transitioned successfully`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown transition tool: ${name}`);
  }
}
