import { z } from 'zod';

export const inspectionStatusSchema = z.enum(['PASS', 'REVIEW', 'BLOCK']);
export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;

export const orderRequirementSchema = z.object({
  item: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  variant: z.string().trim().min(1).optional(),
  personalization: z.string().trim().min(1).optional()
});

export const orderSchema = z.object({
  orderId: z.string().trim().min(1),
  displayNumber: z.string().trim().min(1),
  customerAlias: z.string().trim().min(1),
  requirements: z.array(orderRequirementSchema).min(1)
});

export type Order = z.infer<typeof orderSchema>;

export const observedItemSchema = z.object({
  label: z.string().trim().min(1),
  quantity: z.number().int().nonnegative(),
  attributes: z.record(z.string(), z.string()),
  visibleText: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  evidence: z.string().trim().min(1)
});

export const visibleTextSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.string().trim().min(1)
});

export const packingObservationSchema = z.object({
  observedItems: z.array(observedItemSchema),
  visibleTexts: z.array(visibleTextSchema),
  imageQuality: z.object({
    adequate: z.boolean(),
    issues: z.array(z.string())
  }),
  uncertainties: z.array(z.string())
}).strict();

export type PackingObservation = z.infer<typeof packingObservationSchema>;

export {
  comparePackingInspection,
  DEFAULT_CONFIDENCE_THRESHOLD,
  type ComparisonCheck,
  type ComparisonResult
} from './comparator.js';

