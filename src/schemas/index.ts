import * as yup from 'yup';
import { AddComment } from 'jira.js/dist/esm/types/version3/parameters/addComment.js';
import { markdownToADF, isMarkdown } from '../utils/markdown-to-adf.js';

// ADF (Atlassian Document Format) type
export type ADFDocument = AddComment['comment'];

// Schema for creating an issue
export const createIssueSchema = yup.object({
  projectKey: yup.string().required('Project key is required'),
  summary: yup.string().required('Summary is required').max(255, 'Summary too long'),
  description: yup.mixed()
    .optional()
    .transform(function (value) {
      // If it's a string and looks like markdown, convert to ADF
      if (typeof value === 'string' && isMarkdown(value)) {
        return markdownToADF(value);
      }
      return value;
    }),
  issueType: yup.string().required('Issue type is required'),
  priority: yup.string().optional(),
  assignee: yup.string().optional(),
  parent: yup.string().optional(),
  labels: yup.array().of(yup.string()).optional(),
  components: yup.array().of(yup.string()).optional(),
  fixVersions: yup.array().of(yup.string()).optional(),
  customFields: yup.object().optional(),
});

// Schema for updating an issue
export const updateIssueSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  summary: yup.string().optional().max(255, 'Summary too long'),
  description: yup.mixed()
    .optional()
    .transform(function (value) {
      // If it's a string and looks like markdown, convert to ADF
      if (typeof value === 'string' && isMarkdown(value)) {
        return markdownToADF(value);
      }
      return value;
    }),
  priority: yup.string().optional(),
  assignee: yup.string().optional(),
  parent: yup.string().optional(),
  labels: yup.array().of(yup.string()).optional(),
  components: yup.array().of(yup.string()).optional(),
  fixVersions: yup.array().of(yup.string()).optional(),
  customFields: yup.object().optional(),
});

// Schema for creating a comment
export const createCommentSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  body: yup.mixed()
    .required('Comment body is required')
    .test('is-string', 'Body must be a string', function (value) {
      return typeof value === 'string';
    })
    .transform(function (value) {
      // If it's a string and looks like markdown, convert to ADF
      if (typeof value === 'string' && isMarkdown(value)) {
        return markdownToADF(value);
      }
      // For plain text, create a simple ADF paragraph
      return {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: value
              }
            ]
          }
        ]
      };
    }),
  visibility: yup.object({
    type: yup.string().oneOf(['role', 'group']).optional(),
    value: yup.string().optional(),
  }).optional().default(undefined),
});

// Schema for state transition
export const transitionIssueSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  transitionId: yup.mixed()
    .required('Transition ID is required')
    .transform(function (value) {
      // Convert to string if it's a number
      return String(value);
    }),
  comment: yup.string().optional(),
  fields: yup.object().optional(),
});

// Schema for assigning issue
export const assignIssueSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  assignee: yup.string().required('Assignee is required'),
});


// Schema for getting projects
export const getProjectsSchema = yup.object({
  expand: yup.string().optional(),
  recent: yup.number().optional(),
});

// Schema for getting issue types for a project
export const getIssueTypesSchema = yup.object({
  projectKey: yup.string().required('Project key is required'),
});

// Schema for getting available transitions
export const getTransitionsSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
});

// Schema for getting users
export const getUsersSchema = yup.object({
  query: yup.string().optional(),
  projectKey: yup.string().optional(),
  maxResults: yup.number().min(1).max(100).default(50),
});

// Schema for getting issue details
export const getIssueSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  expand: yup.string().optional(),
  fields: yup.array().of(yup.string()).optional(),
});

// Schema for deleting an issue
export const deleteIssueSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  deleteSubtasks: yup.boolean().default(false),
});

// Schema for getting comments
export const getCommentsSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  startAt: yup.number().min(0).default(0),
  maxResults: yup.number().min(1).max(100).default(50),
});

// Schema for updating comment
export const updateCommentSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  commentId: yup.string().required('Comment ID is required'),
  body: yup.mixed()
    .required('Comment body is required')
    .test('is-string', 'Body must be a string', function (value) {
      return typeof value === 'string';
    })
    .transform(function (value) {
      // If it's a string and looks like markdown, convert to ADF
      if (typeof value === 'string' && isMarkdown(value)) {
        return markdownToADF(value);
      }
      // For plain text, create a simple ADF paragraph
      return {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: value
              }
            ]
          }
        ]
      };
    }),
  visibility: yup.object({
    type: yup.string().oneOf(['role', 'group']).optional(),
    value: yup.string().optional(),
  }).optional().default(undefined),
});

// Schema for deleting comment
export const deleteCommentSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  commentId: yup.string().required('Comment ID is required'),
});

// Schema for getting sprints
export const getSprintsSchema = yup.object({
  boardId: yup.number().required('Board ID is required'),
  state: yup.string().oneOf(['active', 'closed', 'future']).optional(),
});

// Schema for moving issue to sprint
export const moveIssueToSprintSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  sprintId: yup.number().required('Sprint ID is required'),
});

// Schema for getting sprint issues
export const getSprintIssuesSchema = yup.object({
  sprintId: yup.number().required('Sprint ID is required'),
  maxResults: yup.number().min(1).max(100).default(50),
});

// Schema for deleting a sprint
export const deleteSprintSchema = yup.object({
  sprintId: yup.number().required('Sprint ID is required'),
});

// Schema for creating a sprint
export const createSprintSchema = yup.object({
  name: yup.string().required('Sprint name is required'),
  originBoardId: yup.number().required('Origin board ID is required'),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
  goal: yup.string().optional(),
});

// Schema for updating a sprint
export const updateSprintSchema = yup.object({
  sprintId: yup.number().required('Sprint ID is required'),
  name: yup.string().optional(),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
  goal: yup.string().optional(),
  state: yup.string().oneOf(['future', 'active', 'closed']).optional(),
});

// Schema for closing a sprint
export const closeSprintSchema = yup.object({
  sprintId: yup.number().required('Sprint ID is required'),
});

// TypeScript types derived from schemas
export type CreateIssueInput = yup.InferType<typeof createIssueSchema>;
export type UpdateIssueInput = yup.InferType<typeof updateIssueSchema>;
export type CreateCommentInput = yup.InferType<typeof createCommentSchema>;
export type TransitionIssueInput = yup.InferType<typeof transitionIssueSchema>;
export type AssignIssueInput = yup.InferType<typeof assignIssueSchema>;
export type GetProjectsInput = yup.InferType<typeof getProjectsSchema>;
export type GetIssueTypesInput = yup.InferType<typeof getIssueTypesSchema>;
export type GetTransitionsInput = yup.InferType<typeof getTransitionsSchema>;
export type GetUsersInput = yup.InferType<typeof getUsersSchema>;
export type GetIssueInput = yup.InferType<typeof getIssueSchema>;
export type DeleteIssueInput = yup.InferType<typeof deleteIssueSchema>;
export type GetCommentsInput = yup.InferType<typeof getCommentsSchema>;
export type UpdateCommentInput = yup.InferType<typeof updateCommentSchema>;
export type DeleteCommentInput = yup.InferType<typeof deleteCommentSchema>;
export type GetSprintsInput = yup.InferType<typeof getSprintsSchema>;
export type MoveIssueToSprintInput = yup.InferType<typeof moveIssueToSprintSchema>;
export type GetSprintIssuesInput = yup.InferType<typeof getSprintIssuesSchema>;
export type DeleteSprintInput = yup.InferType<typeof deleteSprintSchema>;
export type CreateSprintInput = yup.InferType<typeof createSprintSchema>;
export type UpdateSprintInput = yup.InferType<typeof updateSprintSchema>;
export type CloseSprintInput = yup.InferType<typeof closeSprintSchema>;
