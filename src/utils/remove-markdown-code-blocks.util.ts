/**
 * Removes markdown code blocks from a string.
 * Handles both ```json and ``` code blocks.
 *
 * @param content - The content that may contain markdown code blocks
 * @returns The content with markdown code blocks removed
 */
export function removeMarkdownCodeBlocks(content: string): string {
  const trimmed = content.trim();

  if (trimmed.startsWith('```json')) {
    return trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  }

  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return trimmed;
}
