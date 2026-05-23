import { z } from "zod";

export const serviceCategorySchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sort_order: z.number().int().min(0).default(0),
});

export const serviceCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")).nullable(),
  category_id: z.string().uuid().optional().nullable(),
  duration_minutes: z.coerce.number().int().min(5).max(600),
  price_cents: z.coerce.number().int().min(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  is_active: z.boolean().default(true),
  requires_consent: z.boolean().default(false),
  requires_room: z.boolean().default(false),
  online_bookable: z.boolean().default(true),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
