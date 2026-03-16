const LEGAL_SUFFIXES = [
  'incorporated',
  'inc',
  'llc',
  'l\\.l\\.c',
  'ltd',
  'limited',
  'corp',
  'corporation',
  'company',
  'co',
  'gmbh',
  's\\.r\\.o',
  'sro',
  'plc',
  'bv',
  'oy',
  'ag',
  's\\.a',
  'pte\\. ltd',
  'pte ltd',
] as const;

const LEGAL_SUFFIX_REGEX = new RegExp(
  `(?:,|\\.)?\\s+(?:${LEGAL_SUFFIXES.join('|')})$`,
  'i',
);

function stripLegalSuffix(value: string): string {
  let normalized = value;

  while (LEGAL_SUFFIX_REGEX.test(normalized)) {
    normalized = normalized.replace(LEGAL_SUFFIX_REGEX, '');
  }

  return normalized;
}

export function normalizeCompanyName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const noSuffix = stripLegalSuffix(trimmed);

  return noSuffix.replace(/\s+/g, ' ').trim();
}
