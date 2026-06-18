import { RESUME_OPTIMIZATION_SYSTEM_PROMPT } from './resume-optimization.prompt';

describe('RESUME_OPTIMIZATION_SYSTEM_PROMPT', () => {
  const prompt = RESUME_OPTIMIZATION_SYSTEM_PROMPT;

  describe('four-block structure', () => {
    it('contains the OUTPUT CONTRACT block header', () => {
      expect(prompt).toContain('### OUTPUT CONTRACT');
    });

    it('contains the ATS RULES block header', () => {
      expect(prompt).toContain('### ATS RULES');
    });

    it('contains the OPTIMIZATION MECHANICS block header', () => {
      expect(prompt).toContain('### OPTIMIZATION MECHANICS');
    });

    it('contains the MODE-AWARE CONSTRAINTS block header', () => {
      expect(prompt).toContain('### MODE-AWARE CONSTRAINTS');
    });

    it('orders the blocks OUTPUT CONTRACT → ATS RULES → OPTIMIZATION MECHANICS → MODE-AWARE CONSTRAINTS', () => {
      const oc = prompt.indexOf('### OUTPUT CONTRACT');
      const ar = prompt.indexOf('### ATS RULES');
      const om = prompt.indexOf('### OPTIMIZATION MECHANICS');
      const mc = prompt.indexOf('### MODE-AWARE CONSTRAINTS');
      expect(oc).toBeGreaterThan(-1);
      expect(ar).toBeGreaterThan(oc);
      expect(om).toBeGreaterThan(ar);
      expect(mc).toBeGreaterThan(om);
    });
  });

  describe('ATS RULES content', () => {
    it.each([
      ['Exact keyword match'],
      ['Acronym + spelled-out form'],
      ['Action verbs first'],
      ['Quantification where credible'],
      ['Anti-stuffing'],
      ['Skill–vacancy priority order'],
      ['JobTitle alignment'],
      ['Recency-and-relevance density'],
    ])('lists ATS rule lead-phrase %s', (phrase) => {
      expect(prompt).toContain(phrase);
    });
  });

  describe('bad→good micro-examples', () => {
    it('includes the Responsible-for action-verb example', () => {
      expect(prompt).toContain('Responsible for the frontend team');
      expect(prompt).toContain('Led a 6-engineer frontend team');
    });

    it('includes the page-load quantification example', () => {
      expect(prompt).toContain('Improved page load performance significantly');
      expect(prompt).toContain('Cut median page load from 4.2s to 1.6s');
    });

    it('includes the React anti-stuffing example', () => {
      expect(prompt).toContain('React, React.js, ReactJS, React Hooks');
      expect(prompt).toContain('Built SPA on React (Hooks + Router + Query)');
    });
  });

  describe('mode-interaction gate', () => {
    it('places a mode-interaction gate at the top of MODE-AWARE CONSTRAINTS', () => {
      const mc = prompt.indexOf('### MODE-AWARE CONSTRAINTS');
      const gate = prompt.indexOf('Mode-interaction gate');
      expect(mc).toBeGreaterThan(-1);
      expect(gate).toBeGreaterThan(mc);
    });

    it('the gate cross-references the rules conservative relaxes (#1, #2, #4, #6, #8)', () => {
      const mc = prompt.indexOf('### MODE-AWARE CONSTRAINTS');
      const tail = prompt.slice(mc);
      expect(tail).toMatch(/#1/);
      expect(tail).toMatch(/#2/);
      expect(tail).toMatch(/#4/);
      expect(tail).toMatch(/#6/);
      expect(tail).toMatch(/#8/);
    });
  });

  describe('preserved invariants from the old prompt', () => {
    it('keeps the strict-JSON output rule', () => {
      expect(prompt).toContain('Output **ONLY valid JSON**');
    });

    it('keeps the STRICT DELTA RULE', () => {
      expect(prompt).toContain('STRICT DELTA RULE');
    });

    it('keeps the __new__ placeholder convention', () => {
      expect(prompt).toContain('__new__1');
    });

    it('keeps the scoring formula', () => {
      expect(prompt).toContain(
        'Skills 40%, Experience 30%, Projects 15%, Education 10%, Other 5%',
      );
    });

    it('keeps the merge-by-id semantics line', () => {
      expect(prompt).toContain('backend merges by entry id');
    });
  });
});
