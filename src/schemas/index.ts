import * as yup from 'yup';

// Schema for creating an issue
export const createIssueSchema = yup.object({
  projectKey: yup.string().required('Project key is required'),
  summary: yup.string().required('Summary is required').max(255, 'Summary too long'),
  description: yup.string().optional(),
  issueType: yup.string().required('Issue type is required'),
  priority: yup.string().optional(),
  assignee: yup.string().optional(),
  labels: yup.array().of(yup.string()).optional(),
  components: yup.array().of(yup.string()).optional(),
  fixVersions: yup.array().of(yup.string()).optional(),
  customFields: yup.object().optional(),
});

// Schema for updating an issue
export const updateIssueSchema = yup.object({
  issueKey: yup.string().required('Issue key is required'),
  summary: yup.string().optional().max(255, 'Summary too long'),
  description: yup.string().optional(),
  priority: yup.string().optional(),
  assignee: yup.string().optional(),
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
    .test('is-valid-body', 'Body must be a string or valid ADF JSON', function(value) {
      // If it's a string, check if it's valid JSON
      if (typeof value === 'string') {
        // If it's a simple string (not JSON), it's fine
        if (!value.trim().startsWith('{')) {
          return true;
        }
        // If it looks like JSON, try to parse it
        try {
          const parsed = JSON.parse(value);
          // Verify it has the basic ADF structure
          return parsed && typeof parsed === 'object' && parsed.type === 'doc' && parsed.version === 1;
        } catch {
          return false;
        }
      }
      // If it's an object, verify ADF structure
      if (typeof value === 'object' && value !== null) {
        return (value as any).type === 'doc' && (value as any).version === 1;
      }
      return false;
    })
    .transform(function(value) {
      // If it's a string that looks like JSON, parse it
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        try {
          return JSON.parse(value);
        } catch {
          return value; // If parsing fails, return the original string
        }
      }
      return value;
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
    .transform(function(value) {
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
    .test('is-valid-body', 'Body must be a string or valid ADF JSON', function(value) {
      // If it's a string, check if it's valid JSON
      if (typeof value === 'string') {
        // If it's a simple string (not JSON), it's fine
        if (!value.trim().startsWith('{')) {
          return true;
        }
        // If it looks like JSON, try to parse it
        try {
          const parsed = JSON.parse(value);
          // Verify it has the basic ADF structure
          return parsed && typeof parsed === 'object' && parsed.type === 'doc' && parsed.version === 1;
        } catch {
          return false;
        }
      }
      // If it's an object, verify ADF structure
      if (typeof value === 'object' && value !== null) {
        return (value as any).type === 'doc' && (value as any).version === 1;
      }
      return false;
    })
    .transform(function(value) {
      // If it's a string that looks like JSON, parse it
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        try {
          return JSON.parse(value);
        } catch {
          return value; // If parsing fails, return the original string
        }
      }
      return value;
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
