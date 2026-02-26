/**
 * Domain port for PDF link parsing functionality
 * Pure TypeScript interface - no framework dependencies
 */

export interface IPdfLinkParserPort {
  /**
   * Parses a PDF buffer and extracts all links (mailto, tel, http, https)
   * @param buffer - PDF file buffer
   * @returns Promise resolving to array of extracted links
   */
  extractLinks(buffer: Buffer): Promise<string[]>;
}

/**
 * Symbol token for Dependency Injection
 * Used to inject PDF link parser implementation into application layer
 */
export const PDF_LINK_PARSER_PORT = Symbol('IPdfLinkParserPort');
