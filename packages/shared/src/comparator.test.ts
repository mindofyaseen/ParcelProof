import { describe, expect, it } from 'vitest';
import { comparePackingInspection } from './comparator.js';
import type { Order, PackingObservation } from './index.js';

const order: Order = {
  orderId: 'demo-order',
  displayNumber: 'PP-1001',
  customerAlias: 'Ayesha',
  requirements: [
    { item: 'mug', quantity: 1, variant: 'blue' },
    { item: 'chocolate bar', quantity: 1 },
    { item: 'greeting card', quantity: 1, personalization: 'Happy Birthday Ayesha' }
  ]
};

const correctObservation: PackingObservation = {
  observedItems: [
    { label: 'mug', quantity: 1, attributes: { color: 'blue' }, visibleText: [], confidence: 0.97, evidence: 'One blue mug is visible.' },
    { label: 'chocolate bar', quantity: 1, attributes: {}, visibleText: [], confidence: 0.96, evidence: 'One wrapped chocolate bar is visible.' },
    { label: 'greeting card', quantity: 1, attributes: {}, visibleText: ['Happy Birthday Ayesha'], confidence: 0.95, evidence: 'One greeting card is visible.' }
  ],
  visibleTexts: [{ text: 'Happy Birthday Ayesha', confidence: 0.94, evidence: 'The message is legible on the card.' }],
  imageQuality: { adequate: true, issues: [] },
  uncertainties: []
};

describe('comparePackingInspection', () => {
  it('passes only when every visible requirement is confidently satisfied', () => {
    const result = comparePackingInspection(order, correctObservation);

    expect(result.status).toBe('PASS');
    expect(result.checks).toHaveLength(8);
    expect(result.checks.every((check) => check.result === 'MATCH')).toBe(true);
  });

  it('blocks the deliberately wrong demo parcel with variant and name evidence', () => {
    const wrong: PackingObservation = {
      ...correctObservation,
      observedItems: correctObservation.observedItems.map((item) =>
        item.label === 'mug' ? { ...item, attributes: { color: 'red' }, evidence: 'One red mug is visible.' } : item
      ),
      visibleTexts: [{ text: 'Happy Birthday Alisha', confidence: 0.93, evidence: 'The message is legible on the card.' }]
    };

    const result = comparePackingInspection(order, wrong);

    expect(result.status).toBe('BLOCK');
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'VARIANT', result: 'MISMATCH', expected: 'blue', observed: 'red' }),
      expect.objectContaining({ kind: 'PERSONALIZATION', result: 'MISMATCH', expected: 'Happy Birthday Ayesha', observed: 'Happy Birthday Alisha' })
    ]));
  });

  it('blocks a confidently missing required item', () => {
    const missing = {
      ...correctObservation,
      observedItems: correctObservation.observedItems.filter((item) => item.label !== 'chocolate bar')
    };

    const result = comparePackingInspection(order, missing);

    expect(result.status).toBe('BLOCK');
    expect(result.checks).toContainEqual(expect.objectContaining({ kind: 'ITEM', result: 'MISSING', expected: 'chocolate bar ×1' }));
  });

  it('routes low confidence, poor image quality, and uncertainty to review instead of pass', () => {
    const lowConfidence: PackingObservation = {
      ...correctObservation,
      observedItems: correctObservation.observedItems.map((item) => item.label === 'mug' ? { ...item, confidence: 0.7 } : item),
      imageQuality: { adequate: false, issues: ['Mug is partly occluded'] },
      uncertainties: ['Mug colour may be affected by shadow']
    };

    const result = comparePackingInspection(order, lowConfidence);

    expect(result.status).toBe('REVIEW');
    expect(result.reasons.join(' ')).toMatch(/occluded|confidence|uncertain/i);
    expect(result.status).not.toBe('PASS');
  });

  it('preserves meaningful spelling in personalized text after whitespace normalization', () => {
    const nearMatch: PackingObservation = {
      ...correctObservation,
      visibleTexts: [{ text: '  Happy Birthday Aysha  ', confidence: 0.96, evidence: 'The message is legible.' }]
    };

    expect(comparePackingInspection(order, nearMatch).status).toBe('BLOCK');
  });

  it('matches personalization to the required item instead of unrelated higher-confidence packaging text', () => {
    const packagingText: PackingObservation = {
      ...correctObservation,
      visibleTexts: [
        { text: 'Dairy Milk Chocolate', confidence: 0.99, evidence: 'Brand text is visible on the wrapper.' },
        { text: 'Happy Birthday Ayesha', confidence: 0.92, evidence: 'The message is visible on the greeting card.' }
      ]
    };

    const result = comparePackingInspection(order, packagingText);

    expect(result.status).toBe('PASS');
    expect(result.checks).toContainEqual(expect.objectContaining({
      kind: 'PERSONALIZATION',
      observed: 'Happy Birthday Ayesha',
      result: 'MATCH'
    }));
  });

  it('uses only explicit supported aliases when matching item labels', () => {
    const aliased: PackingObservation = {
      ...correctObservation,
      observedItems: correctObservation.observedItems.map((item) => item.label === 'greeting card' ? { ...item, label: 'birthday card' } : item)
    };

    expect(comparePackingInspection(order, aliased).status).toBe('PASS');
  });
});
