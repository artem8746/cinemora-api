/**
 * Domain port for PDF parsing functionality
 * Pure TypeScript interface - no framework dependencies
 */

export interface IPdfParserPort {
  /**
   * Parses a PDF buffer and extracts text content
   * @param buffer - PDF file buffer
   * @returns Promise resolving to parsed PDF data with text and page count
   */
  getText(buffer: Buffer): Promise<PdfParseResult>;
}

export interface PdfParseResult {
  text: string;
}

/**
 * Symbol token for Dependency Injection
 * Used to inject PDF parser implementation into application layer
 */
export const PDF_PARSER_PORT = Symbol('IPdfParserPort');
