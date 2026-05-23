import { z } from "zod";
import { parsePhoneNumberWithError, isValidPhoneNumber } from "libphonenumber-js";

const phoneE164 = z
  .string()
  .trim()
  .min(1)
  .transform((v, ctx) => {
    try {
      const phone = parsePhoneNumberWithError(v, "AR");
      if (!phone.isValid()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teléfono inválido" });
        return z.NEVER;
      }
      return phone.number;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teléfono inválido" });
      return z.NEVER;
    }
  });

export const clientCreateSchema = z.object({
  full_name: z.string().min(2, "El nombre es obligatorio").max(160),
  phone_e164: phoneE164.optional().nullable(),
  email: z.string().email("Email inválido").optional().or(z.literal("")).nullable(),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .optional()
    .or(z.literal(""))
    .nullable(),
  gender: z.enum(["female", "male", "non_binary", "undisclosed"]).optional().nullable(),
  dni: z.string().optional().or(z.literal("")).nullable(),
  notes: z.string().max(2000).optional().or(z.literal("")).nullable(),
  tags: z.array(z.string()).default([]),
});

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;

export function isValidArPhone(v: string): boolean {
  try {
    return isValidPhoneNumber(v, "AR");
  } catch {
    return false;
  }
}
