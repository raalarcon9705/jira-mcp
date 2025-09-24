import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from '../jira-client.js';
import { getProjectsSchema, getIssueTypesSchema } from '../schemas/index.js';


export function createProjectTools(_jiraClient: JiraClient): Tool[] {
  return [
    {
      name: 'get_projects',
      description: 'Retrieve all Jira projects accessible to the authenticated user. Returns project keys, names, IDs, and basic metadata. Use this to discover available projects before creating issues or performing other operations.',
      inputSchema: {
        type: 'object',
        properties: {
          expand: {
            type: 'string',
            description: 'Comma-separated list of additional data to include: description,lead,issueTypes,url,projectKeys,permissions,insight',
          },
          recent: {
            type: 'number',
            description: 'Return only recently viewed projects (0-20). Useful for quick access to frequently used projects.',
          },
        },
      },
    },
    {
      name: 'get_issue_types',
      description: 'Get all available issue types (Bug, Story, Task, Epic, etc.) for a specific project. Returns type names, IDs, descriptions, and workflow information. Required before creating issues to know valid issueType values.',
      inputSchema: {
        type: 'object',
        properties: {
          projectKey: {
            type: 'string',
            description: 'The project key (e.g., "PROJ") or numeric project ID. Use get_projects to find available project keys.',
          },
        },
        required: ['projectKey'],
      },
    },
  ];
}

export async function handleProjectTool(
  name: string,
  args: Record<string, unknown>,
  jiraClient: JiraClient
) {
  switch (name) {
    case 'get_projects': {
      const validatedArgs = await getProjectsSchema.validate(args);
      const projects = await jiraClient.getProjects(validatedArgs);

      // Extract only essential fields to reduce token usage
      const pageProject = projects;
      const essentialProjects = pageProject.values?.map((project) => ({
        key: project.key,
        name: project.name,
        id: project.id,
        projectTypeKey: project.projectTypeKey
      })) || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialProjects, null, 2),
          },
        ],
      };
    }

    case 'get_issue_types': {
      const validatedArgs = await getIssueTypesSchema.validate(args);
      const issueTypes = await jiraClient.getIssueTypes(validatedArgs);

      // Extract essential fields, remove iconUrl, improve text syntax
      const essentialTypes = issueTypes?.map((type) => ({
        id: type.id,
        name: type.name,
        desc: type.description, // Shorter field name
        subtask: type.subtask,
        level: type.hierarchyLevel // Shorter field name
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(essentialTypes, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown project tool: ${name}`);
  }
}
