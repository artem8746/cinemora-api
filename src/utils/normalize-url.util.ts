export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch (_error) {
    return null;
  }
}
