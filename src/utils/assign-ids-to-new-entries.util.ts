import { randomUUID } from 'crypto';
import { NEW_ENTRY_ID_PREFIX } from '@/openai/constants/prompts/resume-optimization.prompt';
import type {
  SuggestedContentPatch,
  SectionChangeSummary,
} from '@/resume-optimization/presentation/types/resume-analysis';

function isNewEntryPlaceholder(id: unknown): id is string {
  return typeof id === 'string' && id.startsWith(NEW_ENTRY_ID_PREFIX);
}

function resolveId(placeholder: string, idMap: Map<string, string>): string {
  const existing = idMap.get(placeholder);
  if (existing) return existing;

  const id = randomUUID();
  idMap.set(placeholder, id);
  return id;
}

export function assignIdsToNewEntries(
  patch: SuggestedContentPatch,
  sectionChanges: Record<string, SectionChangeSummary>,
): void {
  const idMap = new Map<string, string>();

  if (patch.content) {
    for (const section of Object.values(patch.content)) {
      if (!section?.entries) continue;

      for (const entry of section.entries) {
        const record = entry as Record<string, unknown>;
        if (isNewEntryPlaceholder(record['id'])) {
          record['id'] = resolveId(record['id'], idMap);
        }
      }
    }
  }

  for (const change of Object.values(sectionChanges)) {
    if (!change.entryChanges) continue;

    for (const entryChange of change.entryChanges) {
      if (isNewEntryPlaceholder(entryChange.entryId)) {
        entryChange.entryId = resolveId(entryChange.entryId, idMap);
      }
    }
  }
}
