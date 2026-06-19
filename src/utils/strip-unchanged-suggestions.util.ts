import { NEW_ENTRY_ID_PREFIX } from '@/openai/constants/prompts/resume-optimization.prompt';
import type { ParsedResume } from '@/resume/presentation/types/resume';
import type {
  SuggestedContentPatch,
  SectionChangeSummary,
} from '@/resume-optimization/presentation/types/resume-analysis';

function normalize(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim().replace(/\s+/g, ' ');
  if (typeof value === 'boolean' || typeof value === 'number')
    return String(value);
  return JSON.stringify(value);
}

function isNewEntryId(id: unknown): boolean {
  return typeof id === 'string' && id.startsWith(NEW_ENTRY_ID_PREFIX);
}

function entryEqualsOriginal(
  suggested: Record<string, unknown>,
  original: Record<string, unknown>,
): boolean {
  for (const key of Object.keys(suggested)) {
    if (key === 'id') continue;
    if (normalize(suggested[key]) !== normalize(original[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Strips entries from a SuggestedContentPatch whose content is identical to
 * the original resume. The LLM is instructed to omit unchanged entries, but
 * gpt-4o-mini regularly violates that rule for work/project/education
 * descriptions — this filter is the safety net.
 *
 * Mutates `patch` and `sectionChanges` in place. Skill entries with identical
 * content but a different array position are preserved (reorder is a valid
 * change). New entries (id prefixed with NEW_ENTRY_ID_PREFIX) are always kept.
 */
export function stripUnchangedSuggestions(
  patch: SuggestedContentPatch,
  sectionChanges: Record<string, SectionChangeSummary>,
  originalResume: ParsedResume,
): void {
  const droppedIds = new Set<string>();

  if (patch.personalDetails) {
    const original = (originalResume.personalDetails ??
      {}) as unknown as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      patch.personalDetails as Record<string, unknown>,
    )) {
      if (normalize(value) !== normalize(original[key])) {
        cleaned[key] = value;
      } else {
        droppedIds.add(key);
      }
    }
    if (Object.keys(cleaned).length === 0) {
      delete patch.personalDetails;
    } else {
      patch.personalDetails = cleaned as Partial<
        ParsedResume['personalDetails']
      >;
    }
  }

  if (patch.content) {
    const contentRecord = patch.content as Record<
      string,
      { entries: unknown[] } | undefined
    >;
    const originalContent = (originalResume.content ?? {}) as Record<
      string,
      { entries?: unknown[] } | undefined
    >;

    for (const [sectionKey, section] of Object.entries(contentRecord)) {
      if (!section?.entries) continue;

      const originalEntries = (originalContent[sectionKey]?.entries ??
        []) as Array<Record<string, unknown>>;
      const originalById = new Map<string, Record<string, unknown>>();
      const originalIndexById = new Map<string, number>();
      originalEntries.forEach((entry, index) => {
        const id = entry?.['id'];
        if (typeof id === 'string') {
          originalById.set(id, entry);
          originalIndexById.set(id, index);
        }
      });

      const keptEntries: Array<Record<string, unknown>> = [];
      const suggestedEntries = section.entries as Array<
        Record<string, unknown>
      >;

      suggestedEntries.forEach((entry, suggestedIndex) => {
        const id = entry?.['id'];

        if (isNewEntryId(id) || typeof id !== 'string') {
          keptEntries.push(entry);
          return;
        }

        const original = originalById.get(id);
        if (!original) {
          keptEntries.push(entry);
          return;
        }

        if (!entryEqualsOriginal(entry, original)) {
          keptEntries.push(entry);
          return;
        }

        if (sectionKey === 'skill') {
          const originalIndex = originalIndexById.get(id);
          if (originalIndex !== undefined && originalIndex !== suggestedIndex) {
            keptEntries.push(entry);
            return;
          }
        }

        droppedIds.add(id);
      });

      if (keptEntries.length === 0) {
        delete contentRecord[sectionKey];
      } else {
        section.entries = keptEntries;
      }
    }

    if (Object.keys(contentRecord).length === 0) {
      delete patch.content;
    }
  }

  if (patch.customization?.sectionOrder) {
    const suggestedOrder = patch.customization.sectionOrder;
    const original = originalResume.customization?.sectionOrder;
    const same =
      Array.isArray(original) &&
      original.length === suggestedOrder.length &&
      original.every((s, i) => s === suggestedOrder[i]);
    if (same) {
      delete (patch.customization as { sectionOrder?: string[] }).sectionOrder;
    }
    if (patch.customization && Object.keys(patch.customization).length === 0) {
      delete patch.customization;
    }
  }

  for (const [sectionKey, change] of Object.entries(sectionChanges)) {
    if (!change.entryChanges) continue;
    change.entryChanges = change.entryChanges.filter(
      (ec) => !droppedIds.has(ec.entryId),
    );
    if (change.entryChanges.length === 0) {
      delete sectionChanges[sectionKey];
    }
  }
}
