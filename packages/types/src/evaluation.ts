import * as z from 'zod';
import { AnswerValueSchema } from './definition.js';
import { EvaluationResultSchema } from './profile.js';

export const RiskProfileAnswersSchema = z.record(z.string(), AnswerValueSchema);
export type RiskProfileAnswers = z.infer<typeof RiskProfileAnswersSchema>;

/**
 * Definition-driven evaluation envelope.
 */
export const RiskProfileEvaluationInputSchema = z.object({
  applicantId: z.string().optional(),
  answers: RiskProfileAnswersSchema,
});
export type RiskProfileEvaluationInput = z.infer<
  typeof RiskProfileEvaluationInputSchema
>;

export const RiskProfileBatchEvaluationInputSchema = z.object({
  items: z.array(z.record(z.string(), z.unknown())).min(1),
});
export type RiskProfileBatchEvaluationInput = z.infer<
  typeof RiskProfileBatchEvaluationInputSchema
>;

export const EvaluationErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type EvaluationError = z.infer<typeof EvaluationErrorSchema>;

export const BatchEvaluationItemSchema = z.discriminatedUnion('status', [
  z.object({
    index: z.number().int().nonnegative(),
    applicantId: z.string().optional(),
    status: z.literal('fulfilled'),
    result: EvaluationResultSchema,
  }),
  z.object({
    index: z.number().int().nonnegative(),
    applicantId: z.string().optional(),
    status: z.literal('rejected'),
    error: EvaluationErrorSchema,
  }),
]);
export type BatchEvaluationItem = z.infer<typeof BatchEvaluationItemSchema>;

export const BatchEvaluationResultSchema = z.object({
  items: z.array(BatchEvaluationItemSchema),
  summary: z.object({
    total: z.number().int().nonnegative(),
    fulfilled: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
});
export type BatchEvaluationResult = z.infer<typeof BatchEvaluationResultSchema>;
