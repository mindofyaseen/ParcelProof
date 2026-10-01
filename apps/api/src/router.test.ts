import { describe, expect, it } from 'vitest';
import { extractJson } from './router.js';

describe('Bedrock response parsing', () => {
  it('extracts a fenced JSON object without silently altering it', () => {
    expect(extractJson('```json\n{"uncertainties":[]}\n```')).toEqual({ uncertainties: [] });
  });

  it('rejects malformed model output', () => {
    expect(() => extractJson('not valid JSON')).toThrow();
  });
});
