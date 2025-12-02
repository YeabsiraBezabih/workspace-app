import { z } from "zod";

// Outline validation schemas
export const sectionTypeEnum = z.enum([
  "TABLE_OF_CONTENTS",
  "EXECUTIVE_SUMMARY",
  "TECHNICAL_APPROACH",
  "DESIGN",
  "CAPABILITIES",
  "FOCUS_DOCUMENT",
  "NARRATIVE",
]);

export const outlineStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const reviewerEnum = z.enum(["ASSIM", "BINI", "MAMI"]);

export const createOutlineSchema = z.object({
  header: z.string().min(1, "Header is required"),
  sectionType: sectionTypeEnum,
  status: outlineStatusEnum,
  target: z.number().int().min(0),
  limit: z.number().int().min(0),
  reviewer: reviewerEnum,
});

export const updateOutlineSchema = createOutlineSchema.partial();

// Organization invitation schema
export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.literal("member"),
});

// Organization creation schema
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type CreateOutlineInput = z.infer<typeof createOutlineSchema>;
export type UpdateOutlineInput = z.infer<typeof updateOutlineSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
