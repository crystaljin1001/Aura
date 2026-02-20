/**
 * HTML utility functions
 */

/**
 * Decodes HTML entities to their character equivalents
 * Example: &quot; → ", &amp; → &, etc.
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text) return ''

  const entities: Record<string, string> = {
    '&quot;': '"',
    '&#34;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&nbsp;': ' ',
    '&#160;': ' ',
  }

  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity)
}
