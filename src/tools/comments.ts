import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from '../schemas/index.js';


export function createCommentTools(_jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'create_comment',
      description: 'Add a comment to a Jira issue. Supports plain text or Markdown for rich formatting (headings, lists, code blocks, links, etc.). Markdown is automatically converted to ADF. For mentions, use format: @[accountId:displayName] (get accountId from get_users tool). Returns comment ID and creation details.',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., "PROJ-123") to add the comment to.',
          },
          body: {
            type: 'string',
            description: 'Comment content. Can be plain text or Markdown for rich formatting (headings, lists, code blocks, links, etc.). Markdown will be automatically converted to ADF. For mentions, use format: @[accountId:displayName] (get accountId from get_users tool).',
          },
          visibility: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['role', 'group'],
                description: 'Visibility type: "role" for role-based access or "group" for group-based access.',
              },
              value: {
                type: 'string',
                description: 'Role name or group name for restricted visibility. If not specified, comment is public.',
              },
            },
            description: 'Optional visibility settings to restrict comment access to specific roles or groups.',
          },
        },
        required: ['issueKey', 'body'],
      },
    },
    {
      name: 'get_comments',
      description: 'Get all comments for a Jira issue',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'The issue key to get comments for',
          },
          startAt: {
            type: 'number',
            description: 'Starting index for pagination',
            default: 0,
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of comments to return (1-100)',
            default: 50,
          },
        },
        required: ['issueKey'],
      },
    },
    {
      name: 'update_comment',
      description: 'Update an existing comment on a Jira issue. Supports plain text or Markdown for rich formatting (headings, lists, code blocks, links, etc.). Markdown is automatically converted to ADF. For mentions, use format: @[accountId:displayName] (get accountId from get_users tool).',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'The issue key containing the comment',
          },
          commentId: {
            type: 'string',
            description: 'The ID of the comment to update',
          },
          body: {
            type: 'string',
            description: 'The new comment text. Supports plain text or Markdown for rich formatting (headings, lists, code blocks, links, etc.). Markdown will be automatically converted to ADF. For mentions, use format: @[accountId:displayName] (get accountId from get_users tool).',
          },
          visibility: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['role', 'group'],
                description: 'The visibility type',
              },
              value: {
                type: 'string',
                description: 'The role or group name',
              },
            },
            description: 'Comment visibility settings',
          },
        },
        required: ['issueKey', 'commentId', 'body'],
      },
    },
    {
      name: 'delete_comment',
      description: 'Delete a comment from a Jira issue',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: {
            type: 'string',
            description: 'The issue key containing the comment',
          },
          commentId: {
            type: 'string',
            description: 'The ID of the comment to delete',
          },
        },
        required: ['issueKey', 'commentId'],
      },
    },
  ];
}

export async function handleCommentTool(
  name: string,
  args: Record<string, unknown>,
  jiraClient: JiraClient
) {
  switch (name) {
    case 'create_comment': {
      const validatedArgs = createCommentSchema.cast(args);
      const comment = await jiraClient.createComment(validatedArgs);
      return {
        content: [
          {
            type: 'text',
            text: `Comment ${comment.id} created successfully`,
          },
        ],
      };
    }

    case 'get_comments': {
      const validatedArgs = await getCommentsSchema.validate(args);
      const comments = await jiraClient.getComments(validatedArgs);

      // Extract essential fields, improve syntax
      const commentsData = comments;
      const essentialComments = {
        total: commentsData.total,
        start: commentsData.startAt, // Shorter field name
        max: commentsData.maxResults, // Shorter field name
        items: commentsData.comments?.map((comment) => ({
          id: comment.id,
          author: comment.author?.displayName, // Shorter field name
          authorId: comment.author?.accountId, // Shorter field name
          created: comment.created,
          body: comment.body, // Return full body content (ADF format)
          text: comment.body?.content?.[0]?.content?.[0]?.text || '' // Extract text content for backward compatibility
        })) || []
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialComments, null, 2),
          },
        ],
      };
    }

    case 'update_comment': {
      const validatedArgs = updateCommentSchema.cast(args);
      const result = await jiraClient.updateComment(validatedArgs);
      return {
        content: [
          {
            type: 'text',
            text: `Comment ${result.id} updated successfully`,
          },
        ],
      };
    }

    case 'delete_comment': {
      const validatedArgs = await deleteCommentSchema.validate(args);
      const _result = await jiraClient.deleteComment(validatedArgs);
      return {
        content: [
          {
            type: 'text',
            text: `Comment ${validatedArgs.commentId} deleted successfully`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown comment tool: ${name}`);
  }
}
