import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfluenceClient, Models } from 'confluence.js';
export function createWikiTools(): Tool[] {
  return [
    {
      name: 'query_wiki',
      description: 'Get Confluence page content by specific code (like F4CjNw).',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Page code to search for (like F4CjNw)',
          },
        },
        required: ['query'],
      },
    },
  ];
}

export async function handleWikiTool(
  name: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  try {
    if (name !== 'query_wiki') {
      throw new Error(`Unknown wiki tool: ${name}`);
    }

    const { query } = args as {
      query: string;
    };

    const confluenceClient = new ConfluenceClient({
      host: process.env.JIRA_HOST!,
      authentication: {
        basic: {
          email: process.env.JIRA_EMAIL!,
          apiToken: process.env.JIRA_API_TOKEN!,
        },
      },
    });
    // For codes like F4CjNw, follow redirects to get the page ID
    let pageId = query;

    // If the query is a code like F4CjNw, follow redirects
    if (!/^\d+$/.test(query)) {
      try {
        // Follow redirects to get the page ID
        // eslint-disable-next-line no-undef
        const response = await fetch(`${process.env.JIRA_HOST}/wiki/x/${query}`, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
          },
        });

        if (!response.ok) {
          return {
            content: [
              {
                type: 'text',
                text: `Failed to access page with code: ${query}. Status: ${response.status}`,
              },
            ],
            isError: true,
          };
        }

        // Extract the page ID from the final URL
        const finalUrl = response.url;
        const pageIdMatch = finalUrl.match(/\/pages\/(\d+)/);

        if (!pageIdMatch) {
          return {
            content: [
              {
                type: 'text',
                text: `Could not extract page ID from URL: ${finalUrl}`,
              },
            ],
            isError: true,
          };
        }

        pageId = pageIdMatch[1];
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error following redirects: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }

    // Get the complete page content using the ID
    const page = await confluenceClient.content.getContentById({
      id: pageId,
      expand: ['body.storage', 'space', 'version', 'ancestors'],
    });

    // Convert HTML to plain text
    const plainTextBody = convertHtmlToPlainText(page.body?.storage?.value || '');

    return {
      content: [
        {
          type: 'text',
          text: `# ${page.title}

**ID:** ${page.id}
**Space:** ${page.space?.name} (${page.space?.key})
**URL:** ${page._links?.webui}
**Author:** ${page.version?.by?.displayName}
**Last Modified:** ${page.version?.when}
**Code:** ${query}

## Content

${plainTextBody}

## Page Hierarchy

${page.ancestors?.map((ancestor: Models.Content, index: number) => `${'  '.repeat(index)}- ${ancestor.title} (${ancestor.type})`).join('\n') || 'No hierarchy available'}`,
        },
      ],
    };
  } catch (error) {
    let errorMessage = 'Unknown error occurred';
    let errorType = 'Unknown';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Categorize different types of errors for better debugging
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorType = 'Authentication Error';
        errorMessage = 'Authentication failed. Please check your JIRA_EMAIL and JIRA_API_TOKEN credentials.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorType = 'Permission Error';
        errorMessage = 'Access denied. You may not have permission to access this Confluence space or content.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorType = 'Not Found Error';
        errorMessage = 'Content not found. The page, space, or query may not exist or may not be accessible.';
      } else if (error.message.includes('429') || error.message.includes('Rate Limit')) {
        errorType = 'Rate Limit Error';
        errorMessage = 'Too many requests. Please wait before making another request.';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorType = 'Server Error';
        errorMessage = 'Confluence server error. Please try again later.';
      } else if (error.message.includes('CQL') || error.message.includes('query')) {
        errorType = 'Query Error';
        errorMessage = 'Invalid search query. Please check your search parameters.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorType = 'Network Error';
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        errorType = 'Connection Error';
        errorMessage = 'Cannot connect to Confluence server. Please check the host URL and network connectivity.';
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error in wiki operation (${errorType}): ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

function convertHtmlToPlainText(html: string): string {
  if (!html) return '';

  try {
    // Remove HTML tags and convert HTML entities preserving line breaks
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to line breaks
      .replace(/<\/p>/gi, '\n\n') // Convert </p> to double line breaks
      .replace(/<\/div>/gi, '\n') // Convert </div> to line break
      .replace(/<\/h[1-6]>/gi, '\n\n') // Convert </h1>-</h6> to double line breaks
      .replace(/<\/li>/gi, '\n') // Convert </li> to line break
      .replace(/<\/tr>/gi, '\n') // Convert </tr> to line break
      .replace(/<[^>]*>/g, '') // Remove all other HTML tags
      .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces
      .replace(/&amp;/g, '&') // Convert ampersands
      .replace(/&lt;/g, '<') // Convert less than
      .replace(/&gt;/g, '>') // Convert greater than
      .replace(/&quot;/g, '"') // Convert quotes
      .replace(/&#39;/g, '\'') // Convert apostrophes
      .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs (but not line breaks)
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple consecutive line breaks
      .trim();

    return text;
  } catch (_error) {
    return html; // If there's an error, return the original HTML
  }
}

