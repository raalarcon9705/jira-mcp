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
      // Parse markdown into tokens first
      const tokens = marked.lexer(markdown) as GenericToken[];

      // Convert tokens to ADF nodes without processing mentions
      const content = this.convertTokens(tokens);

      const adfDocument = {
        version: 1,
        type: 'doc',
        content: content
      };

      // Process mentions in the ADF document after conversion
      return this.processMentionsInADF(adfDocument);
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
   * Extracts mention information from markdown text, excluding those in code blocks
   * @param text - The text to extract mentions from
   * @returns Array of mention objects
   */
  private extractMentionsExcludingCodeBlocks(text: string): Array<{ raw: string; id: string; name: string }> {
    const mentionPattern = /@\[([a-f0-9-]+):([^\]]+)\]/g;
    const codeBlockPattern = /```[\s\S]*?```|`[^`\n]+`/g;
    const mentions: Array<{ raw: string; id: string; name: string }> = [];

    // Find all code blocks and inline code
    const codeBlocks: Array<{ start: number; end: number }> = [];
    let codeMatch;

    while ((codeMatch = codeBlockPattern.exec(text)) !== null) {
      codeBlocks.push({
        start: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length
      });
    }

    // Find mentions that are not inside code blocks
    let mentionMatch;
    while ((mentionMatch = mentionPattern.exec(text)) !== null) {
      const mentionStart = mentionMatch.index;
      const mentionEnd = mentionMatch.index + mentionMatch[0].length;

      // Check if this mention is inside any code block
      const isInCodeBlock = codeBlocks.some(block =>
        mentionStart >= block.start && mentionEnd <= block.end
      );

      if (!isInCodeBlock) {
        mentions.push({
          raw: mentionMatch[0],
          id: mentionMatch[1],
          name: mentionMatch[2]
        });
      }
    }

    return mentions;
  }

  /**
   * Extracts mention information from markdown text
   * @param text - The text to extract mentions from
   * @returns Array of mention objects
   */
  private extractMentions(text: string): Array<{ raw: string; id: string; name: string }> {
    const mentionRegex = /@\[([^:]+):([^\]]+)\]/g;
    const mentions: Array<{ raw: string; id: string; name: string }> = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push({
        raw: match[0],
        id: match[1],
        name: match[2]
      });
    }

    return mentions;
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
        const inlineNodes = this.convertInlineToken(inlineToken);
        content.push(...inlineNodes);
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
   * Processes text that may contain mention placeholders
   * @param text - Text with mention placeholders
   * @param mentions - Array of mention objects
   * @returns Array of ADF nodes (text and mention nodes)
   */
  private processTextWithMentions(text: string, mentions?: Array<{ raw: string; id: string; name: string }>): ADFNode[] {
    if (!mentions || mentions.length === 0) {
      return [{
        type: 'text',
        text: text
      }];
    }

    const nodes: ADFNode[] = [];
    let currentText = text;

    // Sort placeholders by their position in the text (descending order to avoid index shifts)
    const placeholderMatches: Array<{ index: number; placeholder: string; mention: { raw: string; id: string; name: string } }> = [];

    mentions.forEach((mention, index) => {
      const placeholder = `MENTIONPLACEHOLDER${index}MENTIONPLACEHOLDER`;
      const placeholderIndex = currentText.indexOf(placeholder);
      if (placeholderIndex !== -1) {
        placeholderMatches.push({
          index: placeholderIndex,
          placeholder,
          mention
        });
      }
    });

    // Sort by index (ascending order)
    placeholderMatches.sort((a, b) => a.index - b.index);

    let lastIndex = 0;
    for (const match of placeholderMatches) {
      // Add text before mention
      if (match.index > lastIndex) {
        nodes.push({
          type: 'text',
          text: currentText.substring(lastIndex, match.index)
        });
      }

      // Add mention node
      nodes.push({
        type: 'mention',
        attrs: {
          id: match.mention.id,
          text: `@${match.mention.name}`,
          userType: 'APP'
        }
      });

      lastIndex = match.index + match.placeholder.length;
    }

    // Add any remaining text
    if (lastIndex < currentText.length) {
      nodes.push({
        type: 'text',
        text: currentText.substring(lastIndex)
      });
    }

    return nodes.length > 0 ? nodes : [{
      type: 'text',
      text: text
    }];
  }

  /**
   * Converts a heading token to ADF heading node
   */
  private convertHeading(token: GenericToken): ADFNode {
    const content: ADFNode[] = [];

    if (token.tokens && token.tokens.length > 0) {
      for (const inlineToken of token.tokens) {
        const inlineNodes = this.convertInlineToken(inlineToken);
        content.push(...inlineNodes);
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
   * Note: Mentions in code blocks are not processed and remain as plain text
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
  private convertInlineToken(token: GenericToken): ADFNode[] {
    const text = token.text || '';

    // Handle nested tokens
    if (token.tokens && token.tokens.length > 0) {
      const nodes: ADFNode[] = [];
      for (const childToken of token.tokens) {
        const childNodes = this.convertInlineToken(childToken);
        nodes.push(...childNodes);
      }

      // Apply formatting to all text nodes
      return nodes.map(node => {
        if (node.type === 'text') {
          return this.applyFormatting(node, token.type);
        }
        return node;
      });
    }

    // Apply formatting to text nodes
    switch (token.type) {
      case 'text':
        return [{
          type: 'text',
          text: text
        }];
      case 'strong':
        return [{
          type: 'text',
          text: text,
          marks: [{ type: 'strong' }]
        }];
      case 'em':
        return [{
          type: 'text',
          text: text,
          marks: [{ type: 'em' }]
        }];
      case 'codespan':
        // For code spans, don't process mentions - keep as plain text
        return [{
          type: 'text',
          text: text,
          marks: [{ type: 'code' }]
        }];
      case 'link':
        return [{
          type: 'text',
          text: text,
          marks: [{
            type: 'link',
            attrs: {
              href: token.href || '',
              title: token.title || ''
            }
          }]
        }];
      case 'del':
        return [{
          type: 'text',
          text: text,
          marks: [{ type: 'strike' }]
        }];
      default:
        return [{
          type: 'text',
          text: text
        }];
    }
  }

  /**
   * Applies formatting to a text node
   */
  private applyFormatting(node: ADFNode, formatType: string): ADFNode {
    if (node.type !== 'text') {
      return node;
    }

    const existingMarks = node.marks || [];
    let newMark;

    switch (formatType) {
      case 'strong':
        newMark = { type: 'strong' };
        break;
      case 'em':
        newMark = { type: 'em' };
        break;
      case 'del':
        newMark = { type: 'strike' };
        break;
      default:
        return node;
    }

    return {
      ...node,
      marks: [...existingMarks, newMark]
    };
  }

  /**
   * Processes mentions in ADF document after conversion
   */
  private processMentionsInADF(adfDocument: ADFDocument): ADFDocument {
    if (typeof adfDocument === 'string') {
      return adfDocument;
    }

    return {
      version: 1,
      type: 'doc',
      content: this.processMentionsInNodes(adfDocument?.content || [])
    };
  }

  /**
   * Processes mentions in an array of ADF nodes
   */
  private processMentionsInNodes(nodes: ADFNode[]): ADFNode[] {
    const result: ADFNode[] = [];
    for (const node of nodes) {
      const processed = this.processMentionsInNode(node);
      if (Array.isArray(processed)) {
        result.push(...processed);
      } else {
        result.push(processed);
      }
    }
    return result;
  }

  /**
   * Processes mentions in a single ADF node
   */
  private processMentionsInNode(node: ADFNode): ADFNode | ADFNode[] {
    // Don't process mentions in code blocks
    if (node.type === 'codeBlock') {
      return node;
    }

    if (node.type === 'text') {
      return this.processMentionsInTextNode(node);
    } else if (node.content && Array.isArray(node.content)) {
      return {
        ...node,
        content: this.processMentionsInNodes(node.content)
      };
    }
    return node;
  }

  /**
   * Processes mentions in a text node
   */
  private processMentionsInTextNode(node: ADFNode): ADFNode | ADFNode[] {
    if (node.type !== 'text' || !node.text) {
      return node;
    }

    // Don't process mentions in code nodes
    if (node.marks && node.marks.some(mark => mark.type === 'code')) {
      return node;
    }

    const mentionPattern = /@\[([a-f0-9-]+):([^\]]+)\]/g;
    const text = node.text;
    const nodes: ADFNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        nodes.push({
          type: 'text',
          text: text.substring(lastIndex, match.index),
          marks: node.marks
        });
      }

      // Add mention node
      nodes.push({
        type: 'mention',
        attrs: {
          id: match[1],
          text: `@${match[2]}`,
          userType: 'APP'
        }
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      nodes.push({
        type: 'text',
        text: text.substring(lastIndex),
        marks: node.marks
      });
    }

    // If no mentions found, return original node
    if (nodes.length === 0) {
      return node;
    }

    // If only one node, return it directly
    if (nodes.length === 1) {
      return nodes[0];
    }

    // Multiple nodes - return all of them
    return nodes;
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
    /@\[[^:]+:[^\]]+\]/,     // Mentions in format @[id:name]
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}
