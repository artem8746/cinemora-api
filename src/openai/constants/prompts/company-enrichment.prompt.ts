export const COMPANY_ENRICHMENT_SYSTEM_PROMPT =
  'You summarize company information strictly from provided context. Do not use prior knowledge. Return only valid JSON.' as const;

// Output contract reference: CompanyProfileDto (`@/openai/types/company-profile.type`).
// If this type changes, update JSON schema in this prompt accordingly.
export const getCompanyEnrichmentPrompt = (params: {
  companyName: string;
  vacancyText: string;
  websiteContent: string | null;
}) => {
  const { companyName, vacancyText, websiteContent } = params;

  return `Company name: ${companyName}

Vacancy context:
${vacancyText}

Website context:
${websiteContent ?? 'No company website context was provided.'}

Return JSON in this exact structure:
{
  "displayName": string,
  "normalizedName": string,
  "domain": string | null,
  "pageUrl": string | null,
  "description": string | null,
  "industry": string | null,
  "headquarters": string | null,
  "size": string | null,
  "reviewsSummary": {
    "rating": number | null,
    "pros": string[],
    "cons": string[],
    "sampleSize": number | null,
    "source": string | null
  } | null,
  "confidence": number,
  "sources": [
    {
      "type": string,
      "url": string | null
    }
  ]
}

Rules:
- Use only the provided vacancy and website context.
- If a value is missing from context, use null.
- Return confidence between 0 and 1.
- Keep pros/cons arrays empty when no clear items are found.
- Keep strings concise.
- Return valid JSON only.`;
};
