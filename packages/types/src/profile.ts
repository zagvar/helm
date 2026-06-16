import * as z from 'zod';

export const RiskBandSchema = z.enum([
  'Conservative',
  'Moderately Conservative',
  'Moderate',
  'Moderately Aggressive',
  'Aggressive',
]);
export type RiskBand = z.infer<typeof RiskBandSchema>;

export const AssetAllocationSchema = z.object({
  equities: z.number().min(0).max(100),
  fixedIncome: z.number().min(0).max(100),
  cash: z.number().min(0).max(100),
  alternatives: z.number().min(0).max(100),
});
export type AssetAllocation = z.infer<typeof AssetAllocationSchema>;

export const ScoreBreakdownSchema = z.record(z.string(), z.number().nonnegative());
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const EvaluatedProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});
export type EvaluatedProfile = z.infer<typeof EvaluatedProfileSchema>;

export const DefinitionReferenceSchema = z.object({
  id: z.string(),
  version: z.string(),
  schemaVersion: z.string(),
  graphChecksum: z.string(),
});
export type DefinitionReference = z.infer<typeof DefinitionReferenceSchema>;

/**
 * Public result returned by core and every adapter.
 *
 * Definition metadata and graph checksum identify the exact rules used for the
 * decision.
 */
export const EvaluationResultSchema = z.object({
  applicantId: z.string().optional(),
  scores: ScoreBreakdownSchema.optional(),
  rawScore: z.number().nonnegative(),
  normalizedScore: z.number().min(0).max(100),
  profile: EvaluatedProfileSchema,
  overrideApplied: z.boolean(),
  overrideId: z.string().optional(),
  allocation: z.record(z.string(), z.number().min(0).max(100)),
  evaluatedAt: z.iso.datetime(),
  definition: DefinitionReferenceSchema,
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
