import { Version3Client } from 'jira.js';
import { config } from 'dotenv';
import type {
  CreateIssueInput,
  UpdateIssueInput,
  CreateCommentInput,
  TransitionIssueInput,
  AssignIssueInput,
  GetProjectsInput,
  GetIssueTypesInput,
  GetTransitionsInput,
  GetUsersInput,
  GetIssueInput,
  DeleteIssueInput,
  GetCommentsInput,
  UpdateCommentInput,
  DeleteCommentInput,
} from './schemas/index.js';
import { AddComment } from 'jira.js/dist/esm/types/version3/parameters/addComment.js';
import { UpdateComment } from 'jira.js/dist/esm/types/version3/parameters/updateComment.js';
import { CreateIssue } from 'jira.js/dist/esm/types/version3/parameters/createIssue.js';

// Load environment variables
config();

export class JiraClient {
  private jira: Version3Client;

  constructor() {
    const host = process.env.JIRA_HOST;
    const email = process.env.JIRA_EMAIL;
    const apiToken = process.env.JIRA_API_TOKEN;

    if (!host || !email || !apiToken) {
      throw new Error('Missing required environment variables: JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN');
    }

    this.jira = new Version3Client({
      host,
      authentication: {
        basic: {
          email,
          apiToken,
        },
      },
    });
  }

  // Get all projects
  async getProjects(input: GetProjectsInput = {}) {
    try {
      const response = await this.jira.projects.searchProjects({
        expand: input.expand,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get issue types for a project
  async getIssueTypes(input: GetIssueTypesInput) {
    try {
      const response = await this.jira.projects.getProject({
        projectIdOrKey: input.projectKey,
        expand: 'issueTypes',
      });
      return response.issueTypes;
    } catch (error) {
      throw new Error(`Failed to get issue types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create an issue
  async createIssue(input: CreateIssueInput) {
    try {
      const issueData: CreateIssue = {
        fields: {
          project: { key: input.projectKey },
          summary: input.summary,
          issuetype: { name: input.issueType },
        },
      };

      if (input.description) {
        issueData.fields.description = input.description;
      }

      if (input.priority) {
        issueData.fields.priority = { name: input.priority };
      }

      if (input.assignee) {
        issueData.fields.assignee = { accountId: input.assignee };
      }

      if (input.labels && input.labels.length > 0) {
        issueData.fields.labels = input.labels.filter(label => label !== undefined) as string[];
      }

      if (input.components && input.components.length > 0) {
        issueData.fields.components = input.components.map(name => ({ name }));
      }

      if (input.fixVersions && input.fixVersions.length > 0) {
        issueData.fields.fixVersions = input.fixVersions.map(name => ({ name }));
      }

      if (input.customFields) {
        Object.assign(issueData.fields, input.customFields);
      }

      const response = await this.jira.issues.createIssue(issueData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get issue details
  async getIssue(input: GetIssueInput) {
    try {
      const response = await this.jira.issues.getIssue({
        issueIdOrKey: input.issueKey,
        expand: input.expand,
        fields: input.fields?.filter(field => field !== undefined),
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update an issue
  async updateIssue(input: UpdateIssueInput) {
    try {
      const updateData: any = {
        fields: {},
      };

      if (input.summary) {
        updateData.fields.summary = input.summary;
      }

      if (input.description) {
        updateData.fields.description = input.description;
      }

      if (input.priority) {
        updateData.fields.priority = { name: input.priority };
      }

      if (input.assignee) {
        updateData.fields.assignee = { accountId: input.assignee };
      }

      if (input.labels) {
        updateData.fields.labels = input.labels;
      }

      if (input.components) {
        updateData.fields.components = input.components.map(name => ({ name }));
      }

      if (input.fixVersions) {
        updateData.fields.fixVersions = input.fixVersions.map(name => ({ name }));
      }

      if (input.customFields) {
        Object.assign(updateData.fields, input.customFields);
      }

      const response = await this.jira.issues.editIssue({
        issueIdOrKey: input.issueKey,
        fields: updateData.fields,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to update issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete an issue
  async deleteIssue(input: DeleteIssueInput) {
    try {
      const response = await this.jira.issues.deleteIssue({
        issueIdOrKey: input.issueKey,
        deleteSubtasks: input.deleteSubtasks,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to delete issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  // Get available transitions for an issue
  async getTransitions(input: GetTransitionsInput) {
    try {
      const response = await this.jira.issues.getTransitions({
        issueIdOrKey: input.issueKey,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get transitions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Move issue to another state
  async transitionIssue(input: TransitionIssueInput) {
    try {
      const transitionData: any = {
        transition: { id: parseInt(String(input.transitionId)) },
      };

      if (input.comment) {
        // Use official ADF format for transition comments
        const adfBody = {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: input.comment
                }
              ]
            }
          ]
        };

        transitionData.update = {
          comment: [{
            add: {
              body: adfBody,
            },
          }],
        };
      }

      if (input.fields) {
        transitionData.fields = input.fields;
      }

      console.error('Transitioning issue with jira.js:', JSON.stringify(transitionData, null, 2));

      const response = await this.jira.issues.doTransition({
        issueIdOrKey: input.issueKey,
        ...transitionData,
      });
      
      return response;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data,
        request: {
          issueKey: input.issueKey,
          transitionId: input.transitionId,
          comment: input.comment,
          fields: input.fields
        }
      };
      console.error('Transition error details:', JSON.stringify(errorDetails, null, 2));
      throw new Error(`Failed to transition issue: ${JSON.stringify(errorDetails, null, 2)}`);
    }
  }

  // Assign issue
  async assignIssue(input: AssignIssueInput) {
    try {
      const response = await this.jira.issues.editIssue({
        issueIdOrKey: input.issueKey,
        fields: {
          assignee: { accountId: input.assignee },
        },
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to assign issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create comment
  async createComment(input: CreateCommentInput) {
    try {
      // If input.body is a simple string, convert it to basic ADF
      let adfBody: AddComment['comment'];
      if (typeof input.body === 'string') {
        adfBody = {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: input.body
                }
              ]
            }
          ]
        };
      } else {
        // If input.body is already an ADF object, use it directly
        adfBody = input.body as AddComment['comment'];
      }

      const response = await this.jira.issueComments.addComment({
        issueIdOrKey: input.issueKey,
        visibility: input.visibility,
        comment: adfBody
      });
      return response;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data,
        request: {
          issueKey: input.issueKey,
          body: input.body,
          visibility: input.visibility
        }
      };
      console.error('Comment creation error details:', JSON.stringify(errorDetails, null, 2));
      throw new Error(`Failed to create comment: ${JSON.stringify(errorDetails, null, 2)}`);
    }
  }

  // Get issue comments
  async getComments(input: GetCommentsInput) {
    try {
      const response = await this.jira.issueComments.getComments({
        issueIdOrKey: input.issueKey,
        startAt: input.startAt,
        maxResults: input.maxResults,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update comment
  async updateComment(input: UpdateCommentInput) {
    try {
      // If input.body is a simple string, convert it to basic ADF
      let adfBody: UpdateComment['body'];
      if (typeof input.body === 'string') {
        adfBody = {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: input.body
                }
              ]
            }
          ]
        };
      } else {
        // If input.body is already an ADF object, use it directly
        adfBody = input.body as UpdateComment['body'];
      }

      const response = await this.jira.issueComments.updateComment({
        issueIdOrKey: input.issueKey,
        id: input.commentId,
        body: adfBody,
        visibility: input.visibility,
      });
      return response;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data,
        request: {
          issueKey: input.issueKey,
          commentId: input.commentId,
          body: input.body,
          visibility: input.visibility
        }
      };
      console.error('Comment update error details:', JSON.stringify(errorDetails, null, 2));
      throw new Error(`Failed to update comment: ${JSON.stringify(errorDetails, null, 2)}`);
    }
  }

  // Delete comment
  async deleteComment(input: DeleteCommentInput) {
    try {
      const response = await this.jira.issueComments.deleteComment({
        issueIdOrKey: input.issueKey,
        id: input.commentId,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search users
  async getUsers(input: GetUsersInput) {
    try {
      const response = await this.jira.userSearch.findUsers({
        query: input.query,
        maxResults: input.maxResults,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get current user information
  async getCurrentUser() {
    try {
      const response = await this.jira.myself.getCurrentUser();
      return response;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
