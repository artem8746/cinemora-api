import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Configuration } from '@/config';
import { ParsedResume } from '@/resume/presentation/types/resume';
import { ResumeRawContent } from '@/resume/presentation/types/resume';

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private readonly configService: ConfigService<Configuration>) {
    const apiKey: string = this.configService.getOrThrow(
      'openai.apiKey' as const,
    );

    this.client = new OpenAI({ apiKey });
  }

  async parseRawResumeContent(
    rawContent: ResumeRawContent,
  ): Promise<ParsedResume> {
    const systemPrompt = `You are a resume parser. Convert the provided resume text and list of links into a strictly typed ParsedResume object.

### OUTPUT RULES
- Output **ONLY valid JSON** matching the ParsedResume TypeScript type.
- Do NOT add comments, explanations, or markdown.
- Preserve the original language of the resume content (do not translate).
- If something is unknown → use an empty string.
- If you are not fully sure where a link belongs → DO NOT guess; leave the field empty.
- Always try to match project links to project titles when there is a clear match.
- Use HTML <ul><li>…</li></ul> for descriptions.
- "title" → use the candidate's full name.
- For ongoing positions (currently employed/studying), use "present" for endDateNew.

### LINK HANDLING RULES
Use the provided "links" array to populate contact and social fields:

**Contact Fields (top-level personalDetails):**
- phone → extract from tel: links (strip "tel:" prefix)
- displayEmail → extract from mailto: links (strip "mailto:" prefix)

**Social Links (personalDetails.social):**
- Detect platform from URL domain (e.g., github.com → "github", linkedin.com → "linkedIn", t.me → "telegram", twitter.com/x.com → "twitter", etc.)
- Use lowercase platform name as key, store as { link: "full URL", display: "username or readable label" }
- For GitHub: prefer profile links over repository links
- Support ANY social platform (behance, dribbble, stackoverflow, medium, dev.to, codepen, etc.)

**Project Links:**
- Match repository/project URLs to project entries when title clearly corresponds
- Store in project's projectTitleLink field

**Photo:**
- If an image URL is present in links (profile photo), use it for personalDetails.photo; otherwise empty string

### STRUCTURE
The output MUST match:

{
  "title": string,

  "personalDetails": {
    "phone": string,
    "photo": string,
    "social": { [key: string]: string },  // key is the platform name, value is URL
    "address": string,
    "fullName": string,
    "jobTitle": string,
  },

  "content": {
    "work": {
      "entries": [{
        "employer": string,
        "jobTitle": string,
        "location": string,
        "endDateNew": string,      // format: "YYYY-MM" or ""
        "description": string,     // HTML with <ul><li>
        "employerLink": string,
        "startDateNew": string     // format: "YYYY-MM"
      }],
    },
    "skill": {
      "entries": [string],
    },
    "profile": string,            // summary/about text
    "project": {
      "entries": [{
        "subTitle": string,
        "endDateNew": string,
        "description": string,     // HTML with <ul><li>
        "projectTitle": string,
        "startDateNew": string,
        "projectTitleLink": string // repo/project URL
      }],
    },
    "education": {
      "entries": [{
        "degree": string,
        "school": string,
        "location": string,
        "endDateNew": string,
        "schoolLink": string,
        "description": string,
        "startDateNew": string
      }],
    }
  }
}

### TASK
Given:
1. "text" → unstructured resume content
2. "links" → array of URLs extracted from the document

Produce a fully structured ParsedResume object.

### INPUT FORMAT
{ "text": "...", "links": ["...", "..."] }`;

    try {
      this.logger.log(`Processing raw resume content`);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify(rawContent),
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error('Failed to parse resume: empty response from OpenAI');
      }

      const parsed = JSON.parse(content) as ParsedResume;

      this.logger.debug(
        `Successfully parsed resume: ${parsed.title || 'Untitled'}`,
      );

      return parsed;
    } catch (error) {
      this.logger.error(
        `Error processing resume raw content: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw error;
    }
  }
}
