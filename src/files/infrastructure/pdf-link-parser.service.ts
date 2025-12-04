import { Injectable, Logger } from '@nestjs/common';
import { IPdfLinkParserPort } from '../domain/pdf-link-parser.port';

@Injectable()
export class PdfLinkParserService implements IPdfLinkParserPort {
  private readonly logger = new Logger(PdfLinkParserService.name);

  /**
   * Extracts all links from a PDF buffer by parsing the PDF structure
   * Supports mailto:, tel:, http://, and https:// links
   */
  extractLinks(buffer: Buffer): string[] {
    this.logger.log('Extracting links from PDF buffer');

    try {
      const pdfContent = buffer.toString('binary');
      const links = new Set<string>();

      // Pattern to match URI annotations in PDF structure
      // Matches /URI (link) patterns in PDF annotations
      const uriPattern = /\/URI\s*\(([^)]+)\)/g;
      let match;

      while ((match = uriPattern.exec(pdfContent)) !== null) {
        const link = match[1];
        if (link) {
          // Decode PDF string encoding (handle escape sequences)
          const decodedLink = this.decodePdfString(link);
          if (this.isValidLink(decodedLink)) {
            links.add(decodedLink);
          }
        }
      }

      // Also search for common link patterns in the text content
      // This catches links that might be in the text but not as annotations
      const textLinkPatterns = [
        /(mailto:[^\s<>"'\\)]+)/gi,
        /(tel:[^\s<>"'\\)]+)/gi,
        /(https?:\/\/[^\s<>"'\\)]+)/gi,
      ];

      for (const pattern of textLinkPatterns) {
        let textMatch;
        while ((textMatch = pattern.exec(pdfContent)) !== null) {
          const link = textMatch[1];
          if (link && this.isValidLink(link)) {
            links.add(link);
          }
        }
      }

      const linksArray = Array.from(links).sort();
      this.logger.log(`Extracted ${linksArray.length} unique links from PDF`);

      return linksArray;
    } catch (error) {
      this.logger.error(
        `Failed to extract links from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new Error(
        `PDF link extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Decodes PDF string encoding
   * Handles escape sequences like \(, \), \\, etc.
   */
  private decodePdfString(str: string): string {
    return str
      .replace(/\\([()\\])/g, '$1') // Unescape parentheses and backslashes
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  }

  /**
   * Validates if a string is a valid link
   * Supports mailto:, tel:, http://, and https:// protocols
   */
  private isValidLink(link: string): boolean {
    const trimmedLink = link.trim();
    if (!trimmedLink) {
      return false;
    }

    const linkPatterns = [
      /^mailto:[^\s<>"']+$/i,
      /^tel:[^\s<>"']+$/i,
      /^https?:\/\/[^\s<>"']+$/i,
    ];

    return linkPatterns.some((pattern) => pattern.test(trimmedLink));
  }
}
