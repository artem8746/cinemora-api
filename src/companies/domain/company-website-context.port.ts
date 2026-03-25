export const COMPANY_WEBSITE_CONTEXT_PORT = Symbol(
  'COMPANY_WEBSITE_CONTEXT_PORT',
);

export interface CompanyWebsiteContextPort {
  fetchWebsiteContent(url: string): Promise<string | null>;
}
