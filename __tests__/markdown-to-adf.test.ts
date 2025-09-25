import { describe, test, expect } from '@jest/globals';
import { markdownToADF, isMarkdown } from '../src/utils/markdown-to-adf';

interface TestADFDocument {
  version: number;
  type: string;
  content: unknown[];
}

interface TestADFTextNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string }>;
}

interface TestADFParagraph {
  type: string;
  content: Array<TestADFTextNode>;
}

interface TestADFListItem {
  type: string;
  content: Array<{
    type: string;
    content: Array<TestADFTextNode>;
  }>;
}

interface TestADFBulletList {
  type: string;
  content: Array<TestADFListItem>;
}

describe('Markdown to ADF with Mentions', () => {
  describe('isMarkdown function', () => {
    test('should detect text with mentions as markdown', () => {
      const text = 'Hello @[6418727f9d6383e32a3261b0:Reynier Rivero]';
      expect(isMarkdown(text)).toBe(true);
    });

    test('should detect regular markdown as markdown', () => {
      const text = '## This is a heading';
      expect(isMarkdown(text)).toBe(true);
    });

    test('should not detect plain text as markdown', () => {
      const text = 'This is just plain text';
      expect(isMarkdown(text)).toBe(false);
    });
  });

  describe('markdownToADF function', () => {
    test('should convert plain text with mention to ADF', () => {
      const markdown = 'Hello @[6418727f9d6383e32a3261b0:Reynier Rivero]';
      const result = markdownToADF(markdown);

      expect(result).toEqual({
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello '
              },
              {
                type: 'mention',
                attrs: {
                  id: '6418727f9d6383e32a3261b0',
                  text: '@Reynier Rivero',
                  userType: 'APP'
                }
              }
            ]
          }
        ]
      });
    });

    test('should convert markdown with mention to ADF', () => {
      const markdown = '## Hello @[6418727f9d6383e32a3261b0:Reynier Rivero]';
      const result = markdownToADF(markdown);

      expect(result).toEqual({
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {
              level: 2
            },
            content: [
              {
                type: 'text',
                text: 'Hello '
              },
              {
                type: 'mention',
                attrs: {
                  id: '6418727f9d6383e32a3261b0',
                  text: '@Reynier Rivero',
                  userType: 'APP'
                }
              }
            ]
          }
        ]
      });
    });

    test('should convert markdown with multiple mentions to ADF', () => {
      const markdown = 'Hello @[6418727f9d6383e32a3261b0:Reynier Rivero], please check with @[6418727f9d6383e32a3261b0:Reynier Rivero]';
      const result = markdownToADF(markdown);

      expect(result).toEqual({
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello '
              },
              {
                type: 'mention',
                attrs: {
                  id: '6418727f9d6383e32a3261b0',
                  text: '@Reynier Rivero',
                  userType: 'APP'
                }
              },
              {
                type: 'text',
                text: ', please check with '
              },
              {
                type: 'mention',
                attrs: {
                  id: '6418727f9d6383e32a3261b0',
                  text: '@Reynier Rivero',
                  userType: 'APP'
                }
              }
            ]
          }
        ]
      });
    });

    test('should convert markdown with bold text and mention to ADF', () => {
      const markdown = '**Hello** @[6418727f9d6383e32a3261b0:Reynier Rivero]';
      const result = markdownToADF(markdown);

      expect(result).toEqual({
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello',
                marks: [{ type: 'strong' }]
              },
              {
                type: 'text',
                text: ' '
              },
              {
                type: 'mention',
                attrs: {
                  id: '6418727f9d6383e32a3261b0',
                  text: '@Reynier Rivero',
                  userType: 'APP'
                }
              }
            ]
          }
        ]
      });
    });

    test('should convert complex markdown with mentions to ADF', () => {
      const markdown = `## Project Update

Hello @[6418727f9d6383e32a3261b0:Reynier Rivero],

Please review the following:

- **Task 1**: Complete by @[6418727f9d6383e32a3261b0:Reynier Rivero]
- **Task 2**: Review with team

> **Note**: @[6418727f9d6383e32a3261b0:Reynier Rivero] should be notified.`;

      const result = markdownToADF(markdown);

      const testResult = result as TestADFDocument;

      // Verify the structure
      expect(testResult.version).toBe(1);
      expect(testResult.type).toBe('doc');
      expect(testResult.content).toHaveLength(5); // heading + 2 paragraphs + bulletList + blockquote

      // Check heading
      expect(testResult.content[0]).toEqual({
        type: 'heading',
        attrs: { level: 2 },
        content: [
          { type: 'text', text: 'Project Update' }
        ]
      });

      // Check first paragraph with mention
      expect(testResult.content[1]).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          {
            type: 'mention',
            attrs: {
              id: '6418727f9d6383e32a3261b0',
              text: '@Reynier Rivero',
              userType: 'APP'
            }
          },
          { type: 'text', text: ',' }
        ]
      });
    });

    test('should handle text without mentions', () => {
      const markdown = 'This is just plain text without mentions';
      const result = markdownToADF(markdown);

      expect(result).toEqual({
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is just plain text without mentions'
              }
            ]
          }
        ]
      });
    });

    test('should handle empty text', () => {
      const markdown = '';
      const result = markdownToADF(markdown);

      expect(result).toEqual({
        version: 1,
        type: 'doc',
        content: []
      });
    });

    test('should ignore mentions inside code blocks', () => {
      const markdown = `## Test de Menciones en Código

Hola @[6418727f9d6383e32a3261b0:Reynier Rivero], este es un comentario con menciones.

### Código con menciones:

\`\`\`javascript
// Ejemplo de código - las menciones aquí NO deben procesarse
const mention = '@[6418727f9d6383e32a3261b0:Reynier Rivero]';
console.log('Esta mención debe quedar como texto plano');
const anotherMention = '@[6418727f9d6383e32a3261b0:Reynier Rivero]';
\`\`\`

### Código inline con menciones:

Aquí hay código inline: \`@[6418727f9d6383e32a3261b0:Reynier Rivero]\` que tampoco debe procesarse.

Por favor, @[6418727f9d6383e32a3261b0:Reynier Rivero], confirma que las menciones en el código no se procesan.`;

      const result = markdownToADF(markdown);

      const testResult = result as TestADFDocument;

      // Verify the structure
      expect(testResult.version).toBe(1);
      expect(testResult.type).toBe('doc');
      expect(testResult.content).toHaveLength(7); // heading + paragraph + heading + codeBlock + heading + paragraph + paragraph

      // Check first paragraph with mention (should be processed)
      expect(testResult.content[1]).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hola ' },
          {
            type: 'mention',
            attrs: {
              id: '6418727f9d6383e32a3261b0',
              text: '@Reynier Rivero',
              userType: 'APP'
            }
          },
          { type: 'text', text: ', este es un comentario con menciones.' }
        ]
      });

      // Check code block - mentions should remain as plain text
      expect(testResult.content[3]).toEqual({
        type: 'codeBlock',
        attrs: {
          language: 'javascript'
        },
        content: [
          {
            type: 'text',
            text: '// Ejemplo de código - las menciones aquí NO deben procesarse\nconst mention = \'@[6418727f9d6383e32a3261b0:Reynier Rivero]\';\nconsole.log(\'Esta mención debe quedar como texto plano\');\nconst anotherMention = \'@[6418727f9d6383e32a3261b0:Reynier Rivero]\';'
          }
        ]
      });

      // Check paragraph with inline code - mention should remain as plain text
      expect(testResult.content[5]).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Aquí hay código inline: ' },
          {
            type: 'text',
            text: '@[6418727f9d6383e32a3261b0:Reynier Rivero]',
            marks: [{ type: 'code' }]
          },
          { type: 'text', text: ' que tampoco debe procesarse.' }
        ]
      });

      // Check last paragraph with mention (should be processed)
      expect(testResult.content[6]).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Por favor, ' },
          {
            type: 'mention',
            attrs: {
              id: '6418727f9d6383e32a3261b0',
              text: '@Reynier Rivero',
              userType: 'APP'
            }
          },
          { type: 'text', text: ', confirma que las menciones en el código no se procesan.' }
        ]
      });
    });

    test('should handle combined text formatting', () => {
      const markdown = `## Combined Formatting

**Bold**: **Bold text**
*Italic*: *Italic text*
~~Strikethrough~~: ~~Strikethrough text~~

### Combined formatting:

- **Bold and italic**: ***Bold and italic text***
- **Bold and strikethrough**: **~~Bold and strikethrough text~~**
- *Italic and strikethrough*: *~~Italic and strikethrough text~~*
- **Bold, italic and strikethrough**: ***~~Bold, italic and strikethrough text~~***`;

      const result = markdownToADF(markdown);
      const testResult = result as TestADFDocument;

      // Verify the structure
      expect(testResult.version).toBe(1);
      expect(testResult.type).toBe('doc');
      expect(testResult.content).toHaveLength(4); // heading + paragraph + heading + bulletList

      // Check the main paragraph with all basic formatting
      const mainParagraph = testResult.content[1] as TestADFParagraph;
      expect(mainParagraph.type).toBe('paragraph');

      // Check that the paragraph contains text with different formatting
      const paragraphContent = mainParagraph.content;
      expect(paragraphContent).toContainEqual({
        type: 'text',
        text: 'Bold',
        marks: [{ type: 'strong' }]
      });
      expect(paragraphContent).toContainEqual({
        type: 'text',
        text: 'Bold text',
        marks: [{ type: 'strong' }]
      });
      expect(paragraphContent).toContainEqual({
        type: 'text',
        text: 'Italic',
        marks: [{ type: 'em' }]
      });
      expect(paragraphContent).toContainEqual({
        type: 'text',
        text: 'Italic text',
        marks: [{ type: 'em' }]
      });
      expect(paragraphContent).toContainEqual({
        type: 'text',
        text: 'Strikethrough',
        marks: [{ type: 'strike' }]
      });
      expect(paragraphContent).toContainEqual({
        type: 'text',
        text: 'Strikethrough text',
        marks: [{ type: 'strike' }]
      });

      // Check bullet list with combined formatting
      const bulletList = testResult.content[3] as TestADFBulletList;
      expect(bulletList.type).toBe('bulletList');
      expect(bulletList.content).toHaveLength(4);

      // Check first bullet: bold + italic
      const firstBullet = bulletList.content[0].content[0].content;
      expect(firstBullet).toContainEqual({
        type: 'text',
        text: 'Bold and italic',
        marks: [{ type: 'strong' }]
      });
      expect(firstBullet).toContainEqual({
        type: 'text',
        text: 'Bold and italic text',
        marks: [{ type: 'strong' }, { type: 'em' }]
      });

      // Check second bullet: bold + strikethrough
      const secondBullet = bulletList.content[1].content[0].content;
      expect(secondBullet).toContainEqual({
        type: 'text',
        text: 'Bold and strikethrough',
        marks: [{ type: 'strong' }]
      });
      expect(secondBullet).toContainEqual({
        type: 'text',
        text: 'Bold and strikethrough text',
        marks: [{ type: 'strike' }, { type: 'strong' }]
      });

      // Check third bullet: italic + strikethrough
      const thirdBullet = bulletList.content[2].content[0].content;
      expect(thirdBullet).toContainEqual({
        type: 'text',
        text: 'Italic and strikethrough',
        marks: [{ type: 'em' }]
      });
      expect(thirdBullet).toContainEqual({
        type: 'text',
        text: 'Italic and strikethrough text',
        marks: [{ type: 'strike' }, { type: 'em' }]
      });

      // Check fourth bullet: bold + italic + strikethrough
      const fourthBullet = bulletList.content[3].content[0].content;
      expect(fourthBullet).toContainEqual({
        type: 'text',
        text: 'Bold, italic and strikethrough',
        marks: [{ type: 'strong' }]
      });
      expect(fourthBullet).toContainEqual({
        type: 'text',
        text: 'Bold, italic and strikethrough text',
        marks: [{ type: 'strike' }, { type: 'strong' }, { type: 'em' }]
      });
    });
  });
});
