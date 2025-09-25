import { marked } from 'marked';
import { ADFDocument } from '../schemas/index.js';

// Types for ADF nodes and marks
interface ADFNode {
  type: string;
  content?: ADFNode[];
  text?: string;
  marks?: ADFMark[];
  attrs?: Record<string, unknown>;
}

interface ADFMark {
  type: string;
  attrs?: Record<string, unknown>;
}

// Generic token interface to handle different token types
interface GenericToken {
  type: string;
  raw: string;
  text?: string;
  tokens?: GenericToken[];
  href?: string;
  title?: string;
  depth?: number;
  ordered?: boolean;
  start?: number;
  items?: GenericToken[];
  lang?: string;
  header?: string[];
  align?: string[];
  cells?: string[][];
  [key: string]: unknown;
}

export class MarkdownToADFConverter {
  private static instance: MarkdownToADFConverter;

  public static getInstance(): MarkdownToADFConverter {
    if (!MarkdownToADFConverter.instance) {
      MarkdownToADFConverter.instance = new MarkdownToADFConverter();
    }
    return MarkdownToADFConverter.instance;
  }

  /**
   * Converts Markdown text to ADF format
   * @param markdown - The markdown text to convert
   * @returns ADF document object
   */
  public convert(markdown: string): ADFDocument {
    if (!markdown || markdown.trim() === '') {
      return this.createEmptyDocument();
    }

    try {
      // Parse markdown into tokens
      const tokens = marked.lexer(markdown) as GenericToken[];

      // Convert tokens to ADF nodes
      const content = this.convertTokens(tokens);

      return {
        version: 1,
        type: 'doc',
        content: content
      };
    } catch (error) {
      console.error('Error converting markdown to ADF:', error);
      // Fallback to plain text paragraph
      return {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: markdown
              }
            ]
          }
        ]
      };
    }
  }

  /**
   * Converts an array of markdown tokens to ADF nodes
   */
  private convertTokens(tokens: GenericToken[]): ADFNode[] {
    const nodes: ADFNode[] = [];

    for (const token of tokens) {
      const node = this.convertToken(token);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Converts a single markdown token to an ADF node
   */
  private convertToken(token: GenericToken): ADFNode | null {
    switch (token.type) {
      case 'paragraph':
        return this.convertParagraph(token);
      case 'heading':
        return this.convertHeading(token);
      case 'blockquote':
        return this.convertBlockquote(token);
      case 'list':
        return this.convertList(token);
      case 'list_item':
        return this.convertListItem(token);
      case 'code':
        return this.convertCodeBlock(token);
      case 'table':
        return this.convertTable(token);
      case 'hr':
        return this.convertHorizontalRule();
      case 'space':
        return null; // Skip spaces
      default:
        // For unknown tokens, try to convert as paragraph
        if (token.text) {
          return this.convertParagraph(token);
        }
        return null;
    }
  }

  /**
   * Converts a paragraph token to ADF paragraph node
   */
  private convertParagraph(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.tokens && token.tokens.length > 0) {
      // Process inline tokens
      for (const inlineToken of token.tokens) {
        const inlineNode = this.convertInlineToken(inlineToken);
        if (inlineNode) {
          content.push(inlineNode);
        }
      }
    } else if (token.text) {
      // Simple text paragraph
      content.push({
        type: 'text',
        text: token.text
      });
    }

    return {
      type: 'paragraph',
      content: content
    };
  }

  /**
   * Converts a heading token to ADF heading node
   */
  private convertHeading(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.tokens && token.tokens.length > 0) {
      for (const inlineToken of token.tokens) {
        const inlineNode = this.convertInlineToken(inlineToken);
        if (inlineNode) {
          content.push(inlineNode);
        }
      }
    } else if (token.text) {
      content.push({
        type: 'text',
        text: token.text
      });
    }

    return {
      type: 'heading',
      attrs: {
        level: token.depth || 1
      },
      content: content
    };
  }

  /**
   * Converts a blockquote token to ADF blockquote node
   */
  private convertBlockquote(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.tokens && token.tokens.length > 0) {
      for (const childToken of token.tokens) {
        const childNode = this.convertToken(childToken);
        if (childNode) {
          content.push(childNode);
        }
      }
    }

    return {
      type: 'blockquote',
      content: content
    };
  }

  /**
   * Converts a list token to ADF list node
   */
  private convertList(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.items && token.items.length > 0) {
      for (const item of token.items) {
        const listItem = this.convertListItem(item);
        if (listItem) {
          content.push(listItem);
        }
      }
    }

    return {
      type: token.ordered ? 'orderedList' : 'bulletList',
      content: content
    };
  }

  /**
   * Converts a list item token to ADF listItem node
   */
  private convertListItem(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.tokens && token.tokens.length > 0) {
      for (const childToken of token.tokens) {
        const childNode = this.convertToken(childToken);
        if (childNode) {
          content.push(childNode);
        }
      }
    }

    return {
      type: 'listItem',
      content: content
    };
  }

  /**
   * Converts a code token to ADF codeBlock node
   */
  private convertCodeBlock(token: GenericToken): ADFNode {
    return {
      type: 'codeBlock',
      attrs: {
        language: token.lang || 'text'
      },
      content: [
        {
          type: 'text',
          text: token.text || ''
        }
      ]
    };
  }

  /**
   * Converts a table token to ADF table node
   */
  private convertTable(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.header && token.cells) {
      // Add header row
      const headerRow: ADFNode = {
        type: 'tableRow',
        content: token.header.map(cell => ({
          type: 'tableHeader',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: cell
                }
              ]
            }
          ]
        }))
      };
      content.push(headerRow);

      // Add data rows
      for (const row of token.cells) {
        const tableRow: ADFNode = {
          type: 'tableRow',
          content: row.map(cell => ({
            type: 'tableCell',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: cell
                  }
                ]
              }
            ]
          }))
        };
        content.push(tableRow);
      }
    }

    return {
      type: 'table',
      content: content
    };
  }

  /**
   * Converts a horizontal rule token to ADF rule node
   */
  private convertHorizontalRule(): ADFNode {
    return {
      type: 'rule'
    };
  }

  /**
   * Converts inline tokens (text, strong, em, link, etc.) to ADF nodes
   */
  private convertInlineToken(token: GenericToken): ADFNode | null {
    switch (token.type) {
      case 'text':
        return {
          type: 'text',
          text: token.text || ''
        };
      case 'strong':
        return {
          type: 'text',
          text: token.text || '',
          marks: [{ type: 'strong' }]
        };
      case 'em':
        return {
          type: 'text',
          text: token.text || '',
          marks: [{ type: 'em' }]
        };
      case 'codespan':
        return {
          type: 'text',
          text: token.text || '',
          marks: [{ type: 'code' }]
        };
      case 'link':
        return {
          type: 'text',
          text: token.text || '',
          marks: [{
            type: 'link',
            attrs: {
              href: token.href || '',
              title: token.title || ''
            }
          }]
        };
      case 'del':
        return {
          type: 'text',
          text: token.text || '',
          marks: [{ type: 'strike' }]
        };
      default:
        // For unknown inline tokens, return as plain text
        if (token.text) {
          return {
            type: 'text',
            text: token.text
          };
        }
        return null;
    }
  }

  /**
   * Creates an empty ADF document
   */
  private createEmptyDocument(): ADFDocument {
    return {
      version: 1,
      type: 'doc',
      content: []
    };
  }
}

/**
 * Utility function to convert markdown to ADF
 * @param markdown - The markdown text to convert
 * @returns ADF document object
 */
export function markdownToADF(markdown: string): ADFDocument {
  return MarkdownToADFConverter.getInstance().convert(markdown);
}

/**
 * Utility function to check if a string is markdown
 * @param text - The text to check
 * @returns true if the text appears to be markdown
 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /\*\*.*?\*\*/,           // Bold
    /\*.*?\*/,               // Italic
    /`.*?`/,                 // Inline code
    /```[\s\S]*?```/,        // Code blocks
    /^\s*[-*+]\s+/m,         // Unordered lists
    /^\s*\d+\.\s+/m,         // Ordered lists
    /^\s*>\s+/m,             // Blockquotes
    /\[.*?\]\(.*?\)/,        // Links
    /^\s*\|.*\|.*\|/m,       // Tables
    /^---+$/m,               // Horizontal rules
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}
