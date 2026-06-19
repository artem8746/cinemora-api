import { stripUnchangedSuggestions } from './strip-unchanged-suggestions.util';
import { NEW_ENTRY_ID_PREFIX } from '@/openai/constants/prompts/resume-optimization.prompt';
import type { ParsedResume } from '@/resume/presentation/types/resume';
import type {
  SuggestedContentPatch,
  SectionChangeSummary,
} from '@/resume-optimization/presentation/types/resume-analysis';

function makeResume(overrides: Partial<ParsedResume> = {}): ParsedResume {
  return {
    id: 'resume-1',
    userId: 'user-1',
    title: 'Resume',
    personalDetails: {
      phone: '',
      photo: '',
      social: {},
      address: '',
      fullName: 'Jane Doe',
      jobTitle: 'Frontend Engineer',
      detailsOrder: [],
      displayEmail: '',
    },
    content: {
      profile: {
        entries: [],
        iconKey: '',
        displayName: '',
        sectionType: 'profile',
      },
      work: { entries: [], iconKey: '', displayName: '', sectionType: 'work' },
      skill: {
        entries: [],
        iconKey: '',
        displayName: '',
        sectionType: 'skill',
      },
      project: {
        entries: [],
        iconKey: '',
        displayName: '',
        sectionType: 'project',
      },
      education: {
        entries: [],
        iconKey: '',
        displayName: '',
        sectionType: 'education',
      },
    },
    customization: {
      sectionOrder: ['profile', 'work', 'skill', 'project', 'education'],
    },
    ...overrides,
  };
}

describe('stripUnchangedSuggestions', () => {
  it('removes work entries whose every field matches the original and drops their entryChanges', () => {
    const resume = makeResume({
      content: {
        profile: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'profile',
        },
        work: {
          entries: [
            {
              id: 'work-1',
              employer: 'Acme',
              jobTitle: 'Frontend Dev',
              location: 'Remote',
              startDate: '2020-01',
              endDate: '2022-01',
              description: '<ul><li>Built things</li></ul>',
              employerLink: '',
              isHidden: false,
            },
          ],
          iconKey: '',
          displayName: '',
          sectionType: 'work',
        },
        skill: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'skill',
        },
        project: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'project',
        },
        education: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'education',
        },
      },
    });

    const patch: SuggestedContentPatch = {
      content: {
        work: {
          entries: [
            {
              id: 'work-1',
              employer: 'Acme',
              jobTitle: 'Frontend Dev',
              location: 'Remote',
              startDate: '2020-01',
              endDate: '2022-01',
              description: '<ul><li>Built things</li></ul>',
              employerLink: '',
              isHidden: false,
            },
          ],
        },
      },
    };
    const sectionChanges: Record<string, SectionChangeSummary> = {
      work: {
        summary: 'Tweaked',
        entryChanges: [
          {
            entryId: 'work-1',
            description: 'noop',
            atsScoreImpact: 2,
            matchScoreImpact: 1,
          },
        ],
      },
    };

    stripUnchangedSuggestions(patch, sectionChanges, resume);

    expect(patch.content).toBeUndefined();
    expect(sectionChanges.work).toBeUndefined();
  });

  it('keeps work entries whose description differs from the original (whitespace-normalized)', () => {
    const resume = makeResume({
      content: {
        profile: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'profile',
        },
        work: {
          entries: [
            {
              id: 'work-1',
              employer: 'Acme',
              jobTitle: 'Frontend Dev',
              location: '',
              startDate: '',
              endDate: '',
              description: 'Responsible for X',
              employerLink: '',
              isHidden: false,
            },
          ],
          iconKey: '',
          displayName: '',
          sectionType: 'work',
        },
        skill: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'skill',
        },
        project: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'project',
        },
        education: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'education',
        },
      },
    });

    const patch: SuggestedContentPatch = {
      content: {
        work: {
          entries: [
            {
              id: 'work-1',
              employer: 'Acme',
              jobTitle: 'Frontend Dev',
              location: '',
              startDate: '',
              endDate: '',
              description: 'Led X across Y team',
              employerLink: '',
              isHidden: false,
            },
          ],
        },
      },
    };
    const sectionChanges: Record<string, SectionChangeSummary> = {
      work: {
        summary: 'Strengthened',
        entryChanges: [
          {
            entryId: 'work-1',
            description: 'verb fix',
            atsScoreImpact: 4,
            matchScoreImpact: 3,
          },
        ],
      },
    };

    stripUnchangedSuggestions(patch, sectionChanges, resume);

    expect(patch.content?.work?.entries).toHaveLength(1);
    expect(sectionChanges.work?.entryChanges).toHaveLength(1);
  });

  it('always keeps entries whose id is a __new__ placeholder', () => {
    const resume = makeResume();
    const patch: SuggestedContentPatch = {
      content: {
        work: {
          entries: [
            {
              id: `${NEW_ENTRY_ID_PREFIX}1`,
              employer: 'NDA',
              jobTitle: 'Staff',
              location: '',
              startDate: '',
              endDate: '',
              description: 'new role',
              employerLink: '',
              isHidden: false,
            },
          ],
        },
      },
    };
    const sectionChanges: Record<string, SectionChangeSummary> = {};

    stripUnchangedSuggestions(patch, sectionChanges, resume);

    expect(patch.content?.work?.entries).toHaveLength(1);
  });

  it('keeps skill entries whose content matches but array position differs', () => {
    const resume = makeResume({
      content: {
        profile: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'profile',
        },
        work: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'work',
        },
        skill: {
          entries: [
            { id: 's1', skill: 'React', description: '', isHidden: false },
            { id: 's2', skill: 'TypeScript', description: '', isHidden: false },
          ],
          iconKey: '',
          displayName: '',
          sectionType: 'skill',
        },
        project: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'project',
        },
        education: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'education',
        },
      },
    });

    const patch: SuggestedContentPatch = {
      content: {
        skill: {
          entries: [
            { id: 's2', skill: 'TypeScript', description: '', isHidden: false },
            { id: 's1', skill: 'React', description: '', isHidden: false },
          ],
        },
      },
    };

    stripUnchangedSuggestions(patch, {}, resume);

    expect(
      patch.content?.skill?.entries.map((e) => (e as { id: string }).id),
    ).toEqual(['s2', 's1']);
  });

  it('drops skill entries that are content- AND position-identical to original', () => {
    const resume = makeResume({
      content: {
        profile: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'profile',
        },
        work: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'work',
        },
        skill: {
          entries: [
            { id: 's1', skill: 'React', description: '', isHidden: false },
          ],
          iconKey: '',
          displayName: '',
          sectionType: 'skill',
        },
        project: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'project',
        },
        education: {
          entries: [],
          iconKey: '',
          displayName: '',
          sectionType: 'education',
        },
      },
    });

    const patch: SuggestedContentPatch = {
      content: {
        skill: {
          entries: [
            { id: 's1', skill: 'React', description: '', isHidden: false },
          ],
        },
      },
    };

    stripUnchangedSuggestions(patch, {}, resume);

    expect(patch.content).toBeUndefined();
  });

  it('strips personalDetails keys equal to the original and their entryChanges', () => {
    const resume = makeResume();
    const patch: SuggestedContentPatch = {
      personalDetails: {
        jobTitle: 'Frontend Engineer',
        fullName: 'Jane D.',
      },
    };
    const sectionChanges: Record<string, SectionChangeSummary> = {
      personalDetails: {
        summary: 'Title tightened',
        entryChanges: [
          {
            entryId: 'jobTitle',
            description: 'same',
            atsScoreImpact: 0,
            matchScoreImpact: 0,
          },
          {
            entryId: 'fullName',
            description: 'shortened',
            atsScoreImpact: 1,
            matchScoreImpact: 0,
          },
        ],
      },
    };

    stripUnchangedSuggestions(patch, sectionChanges, resume);

    expect(patch.personalDetails).toEqual({ fullName: 'Jane D.' });
    expect(
      sectionChanges.personalDetails?.entryChanges?.map((c) => c.entryId),
    ).toEqual(['fullName']);
  });

  it('drops customization.sectionOrder when identical to original', () => {
    const resume = makeResume();
    const patch: SuggestedContentPatch = {
      customization: {
        sectionOrder: ['profile', 'work', 'skill', 'project', 'education'],
      },
    };

    stripUnchangedSuggestions(patch, {}, resume);

    expect(patch.customization).toBeUndefined();
  });
});
