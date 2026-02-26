export interface PdfOptions {
  format: 'A4';
  printBackground: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  preferCSSPageSize?: boolean;
}

export interface IPdfGeneratorPort {
  generatePdf(html: string, options: PdfOptions): Promise<Buffer>;
}

export const PDF_GENERATOR_PORT = Symbol('IPdfGeneratorPort');
