import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { IPdfGeneratorPort, PdfOptions } from '../domain/pdf-generator.port';

@Injectable()
export class PuppeteerPdfGeneratorService implements IPdfGeneratorPort {
  private readonly logger = new Logger(PuppeteerPdfGeneratorService.name);

  async generatePdf(html: string, options: PdfOptions): Promise<Buffer> {
    this.logger.log('Generating PDF from HTML');

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      const wrappedHtml = this.wrapHtml(html);

      await page.setContent(wrappedHtml, {
        waitUntil: 'networkidle0',
      });

      // networkidle0 doesn't guarantee fonts are rendered — wait explicitly
      await page.evaluate(() => document.fonts.ready);

      const pdfBuffer = await page.pdf({
        format: options.format,
        printBackground: options.printBackground ?? true,
        margin: options.margin || {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
        preferCSSPageSize: options.preferCSSPageSize ?? true,
      });

      this.logger.log(`PDF generated successfully (${pdfBuffer.length} bytes)`);

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw new Error(
        `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Wraps HTML fragments in a full document.
   * Full documents get print styles injected into <head>.
   */
  private wrapHtml(html: string): string {
    const isFullDocument = /<html[\s>]/i.test(html);

    if (isFullDocument) {
      return this.injectIntoHead(html);
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${this.getPageBreakCss()}
  </style>
</head>
<body>
  ${html}
</body>
</html>`.trim();
  }

  /** Injects page-break CSS into an existing full HTML document */
  private injectIntoHead(html: string): string {
    const payload = `<style>${this.getPageBreakCss()}</style>`;

    const headCloseIndex = html.indexOf('</head>');
    if (headCloseIndex !== -1) {
      return (
        html.slice(0, headCloseIndex) + payload + html.slice(headCloseIndex)
      );
    }

    const htmlOpenMatch = html.match(/<html[^>]*>/i);
    if (htmlOpenMatch?.index !== undefined) {
      const insertPos = htmlOpenMatch.index + htmlOpenMatch[0].length;
      return (
        html.slice(0, insertPos) +
        `<head>${payload}</head>` +
        html.slice(insertPos)
      );
    }

    return payload + html;
  }

  private getPageBreakCss(): string {
    return `
    @page { size: A4; margin: 0; }

    *, *::before, *::after { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    body { margin: 0; padding: 0; }

    .page-break { page-break-before: always; break-before: page; }
    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; break-after: avoid; }

    .resume-page {
      box-shadow: none !important;
      overflow: visible !important;
      flex-shrink: unset !important;
      margin: 0 !important;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .resume-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    `;
  }
}
