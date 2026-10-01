import type { InspectionStatus, Order, PackingObservation } from './index.js';

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.85;

type CheckKind = 'ITEM' | 'QUANTITY' | 'VARIANT' | 'PERSONALIZATION';
type CheckResult = 'MATCH' | 'MISMATCH' | 'MISSING' | 'UNCERTAIN';

export interface ComparisonCheck {
  kind: CheckKind;
  requirement: string;
  expected: string;
  observed: string;
  result: CheckResult;
  confidence?: number;
  evidence: string;
}

export interface ComparisonResult {
  status: InspectionStatus;
  checks: ComparisonCheck[];
  reasons: string[];
  confidenceThreshold: number;
}

function normalize(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ');
}

function normalizedKey(value: string): string {
  return normalize(value).toLocaleLowerCase('en');
}

function canonicalItem(value: string): string {
  const key = normalizedKey(value);
  if (['cup'].includes(key) || /\bmug\b/.test(key)) return 'mug';
  if (/\bcard\b/.test(key)) return 'greeting card';
  if (/\bchocolate\b/.test(key)) return 'chocolate bar';
  return key;
}

export function comparePackingInspection(
  order: Order,
  observation: PackingObservation,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD
): ComparisonResult {
  const checks: ComparisonCheck[] = [];
  const reasons = new Set<string>();
  let hasBlock = false;
  let hasReview = false;

  if (!observation.imageQuality.adequate) {
    hasReview = true;
    reasons.add(`Image quality needs review: ${observation.imageQuality.issues.join('; ') || 'quality was marked inadequate'}.`);
  }

  if (observation.uncertainties.length > 0) {
    hasReview = true;
    reasons.add(`Model uncertainty: ${observation.uncertainties.join('; ')}.`);
  }

  for (const requirement of order.requirements) {
    const observed = observation.observedItems.find(
      (item) => canonicalItem(item.label) === canonicalItem(requirement.item)
    );
    const requirementLabel = `${requirement.item} ×${requirement.quantity}`;

    if (!observed) {
      const uncertainImage = !observation.imageQuality.adequate || observation.uncertainties.length > 0;
      checks.push({
        kind: 'ITEM',
        requirement: requirement.item,
        expected: requirementLabel,
        observed: 'Not observed',
        result: uncertainImage ? 'UNCERTAIN' : 'MISSING',
        evidence: uncertainImage ? 'The image does not establish whether the item is present.' : 'No matching item was observed in an otherwise adequate image.'
      });
      if (uncertainImage) {
        hasReview = true;
        reasons.add(`${requirement.item} could not be established from the image.`);
      } else {
        hasBlock = true;
        reasons.add(`Required item missing: ${requirement.item}.`);
      }
      continue;
    }

    const confident = observed.confidence >= confidenceThreshold;
    checks.push({
      kind: 'ITEM',
      requirement: requirement.item,
      expected: requirement.item,
      observed: observed.label,
      result: confident ? 'MATCH' : 'UNCERTAIN',
      confidence: observed.confidence,
      evidence: observed.evidence
    });

    if (!confident) {
      hasReview = true;
      reasons.add(`${requirement.item} confidence ${observed.confidence.toFixed(2)} is below ${confidenceThreshold.toFixed(2)}.`);
    }

    const quantityMatches = observed.quantity === requirement.quantity;
    checks.push({
      kind: 'QUANTITY',
      requirement: requirement.item,
      expected: String(requirement.quantity),
      observed: String(observed.quantity),
      result: confident ? (quantityMatches ? 'MATCH' : 'MISMATCH') : 'UNCERTAIN',
      confidence: observed.confidence,
      evidence: observed.evidence
    });
    if (confident && !quantityMatches) {
      hasBlock = true;
      reasons.add(`Wrong quantity for ${requirement.item}: expected ${requirement.quantity}, observed ${observed.quantity}.`);
    }

    if (requirement.variant) {
      const expectedVariant = normalize(requirement.variant);
      const observedVariantRaw = observed.attributes.color ?? observed.attributes.variant;
      const observedVariant = observedVariantRaw ? normalize(observedVariantRaw) : undefined;
      const variantMatches = observedVariant !== undefined && normalizedKey(observedVariant) === normalizedKey(expectedVariant);
      checks.push({
        kind: 'VARIANT',
        requirement: requirement.item,
        expected: expectedVariant,
        observed: observedVariant ?? 'Not established',
        result: !confident || !observedVariant ? 'UNCERTAIN' : (variantMatches ? 'MATCH' : 'MISMATCH'),
        confidence: observed.confidence,
        evidence: observed.evidence
      });
      if (!observedVariant || !confident) {
        hasReview = true;
        reasons.add(`${requirement.item} variant could not be established confidently.`);
      } else if (!variantMatches) {
        hasBlock = true;
        reasons.add(`Wrong variant for ${requirement.item}: expected ${expectedVariant}, observed ${observedVariant}.`);
      }
    }

    if (requirement.personalization) {
      const expectedText = normalize(requirement.personalization);
      const bestText = [...observation.visibleTexts].sort((a, b) => b.confidence - a.confidence)[0];
      const textConfident = bestText !== undefined && bestText.confidence >= confidenceThreshold;
      const textMatches = bestText !== undefined && normalize(bestText.text) === expectedText;
      checks.push({
        kind: 'PERSONALIZATION',
        requirement: requirement.item,
        expected: expectedText,
        observed: bestText ? normalize(bestText.text) : 'Not established',
        result: !textConfident ? 'UNCERTAIN' : (textMatches ? 'MATCH' : 'MISMATCH'),
        confidence: bestText?.confidence,
        evidence: bestText?.evidence ?? 'No readable personalized text was observed.'
      });
      if (!textConfident) {
        hasReview = true;
        reasons.add(`Personalized text for ${requirement.item} could not be read confidently.`);
      } else if (!textMatches) {
        hasBlock = true;
        reasons.add(`Personalization mismatch for ${requirement.item}.`);
      }
    }
  }

  const status: InspectionStatus = hasBlock ? 'BLOCK' : hasReview ? 'REVIEW' : 'PASS';
  return { status, checks, reasons: [...reasons], confidenceThreshold };
}
