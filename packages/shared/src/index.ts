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

