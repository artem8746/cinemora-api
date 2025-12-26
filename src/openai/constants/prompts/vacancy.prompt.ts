export const VACANCY_PARSER_SYSTEM =
  'You are a vacancy parser. Extract all data and translate everything to English. Respond only with valid JSON without markdown formatting.' as const;

export const VACANCY_PARSER_PROMPT =
  `Extract data and translate ALL text content to English in the following format:
{
  "isVacancy": boolean,
  "data": {
    "title": string,
    "company": string,
    "location": string,
    "salary": string | null,
    "description": string,
    "employmentType": string | null,
    "workType": string | null,
    "duration": string | null,
    "experienceLevel": string | null,
    "responsibilities": string[],
    "requirements": string[],
    "niceToHave": string[],
    "skills": string[],
    "benefits": string[]
  }
}

CRITICAL EXTRACTION RULES:

0. BASIC FIELDS:
   - "employmentType": Extract from "Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary", "Permanent". Look for phrases like "Full-time position", "Part-time job", "Contract role", etc. If not specified, set to null.
   - "workType": Extract from "Remote", "On-site", "Onsite", "Hybrid", "Office-based". Look in location field, job description, or dedicated sections. If "Remote" is mentioned anywhere, use "Remote". If not specified, set to null.
   - "duration": Extract contract/project duration like "Long-term", "Short-term", "1+ year", "6 months", "Permanent", "Temporary". Look for phrases like "Duration — long-term", "Long-term position", "Contract for 6 months", etc. If not specified, set to null.
   - "experienceLevel": Extract from title or description: "Junior", "Middle", "Mid", "Senior", "Lead", "Principal", "Entry-level", "Intern". If not in title, look in requirements section. If not specified, set to null.
   - "location": Physical location (city, country) - separate from workType. If remote, location might be "Remote" or company location, but workType should be "Remote".

1. MANDATORY REQUIREMENTS ("requirements"):
   - Look for sections titled: "Requirements", "What You Need", "Must Have", "Required", "Qualifications", "What We're Looking For" (when it's about requirements)
   - Include ALL mandatory qualifications, skills, experience levels, education, certifications, work permits, language requirements
   - If requirements are mixed with other content, extract only the requirement items

2. PREFERRED/NICE TO HAVE ("niceToHave"):
   - Look for sections titled: "Nice to Have", "Nice to Have:", "Big Plus", "Plus", "Bonus", "Preferred", "Would Be Nice", "Additional", "Extra", "Also Great", "Considered a Plus", "A Plus", "Advantage", "Preferable"
   - Include ANY content marked as optional, preferred, bonus, or "plus" - be flexible with wording variations
   - If you see phrases like "experience with X is a plus", "interest in Y preferred", "knowledge of Z would be nice" - put them here
   - Be smart: if something is clearly optional/preferred (even if not explicitly labeled), include it here

3. SKILLS ("skills"):
   - Extract from "Tech Stack", "Technologies", "Skills", "Technologies Used", "Stack", "Tools", "Technologies & Tools"
   - Include programming languages, frameworks, libraries, tools, platforms mentioned anywhere
   - Extract from job description if tech stack section is missing
   - Include both frontend and backend technologies

4. BENEFITS ("benefits"):
   - Look for sections: "Benefits", "Perks", "What We Offer", "Compensation", "Why Work With Us", "We Offer", "Additional Benefits"
   - Include: health insurance, stock options, bonuses, vacation days, flexible hours, learning budget, equipment, gym membership, etc.
   - DO NOT include employment type (Full-time/Part-time), work type (Remote/On-site), or duration here - those go to separate fields
   - Extract from anywhere benefits are mentioned, even if not in a dedicated section

5. RESPONSIBILITIES ("responsibilities"):
   - Look for: "Responsibilities", "What You'll Do", "Your Role", "Key Responsibilities", "Duties", "What You'll Be Doing"
   - Include all tasks, duties, and responsibilities mentioned

6. GENERAL RULES:
   - Translate ALL text to English
   - Be thorough - don't miss information even if it's in unusual sections or formats
   - If a section could fit multiple categories, use your judgment based on context
   - Extract company name from anywhere it appears (header, footer, description, etc.)
   - Extract location from job description, location field, or remote/hybrid mentions
   - If salary is mentioned anywhere (even in benefits), extract it
   - Don't leave arrays empty if information exists - be proactive in finding and categorizing content` as const;
