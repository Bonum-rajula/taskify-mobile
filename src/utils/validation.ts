// src/utils/validation.ts
import { z } from 'zod';

// ============================================================================
// PRIMITIVES (DRY Principle)
// We define these once so they can be reused across Login, Register, and Profile screens.
// ============================================================================

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordLoginSchema = z
  .string()
  .min(1, 'Password is required');

const passwordStrictSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ============================================================================
// FORM SCHEMAS (SOC Principle)
// These schemas govern the exact shape of our UI forms.
// ============================================================================

// --- Auth Schemas ---
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordLoginSchema,
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: emailSchema,
  password: passwordStrictSchema,
});

// --- Profile Schemas ---
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordStrictSchema,
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from your current password",
  path: ["newPassword"],
});

// ============================================================================
// TYPE INFERENCE (SOLID Principle)
// We extract the TypeScript interfaces directly from the schemas.
// ============================================================================

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;