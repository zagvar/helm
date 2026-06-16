import * as z from 'zod';
import {
  RiskProfileEvaluationInputSchema,
} from '@vibedcoder/invespro-types';
import type {
  AnswerValue,
  EvaluationResult,
  RiskProfileAnswers,
  RiskProfileDefinition,
  RiskProfileEvaluationInput,
} from '@vibedcoder/invespro-types';
import { scoreField, toSnakeCase } from './compiler.js';

const ModernJdmResultSchema = z.object({
  profile_id: z.string(),
  raw_score: z.number().nonnegative(),
  normalized_score: z.number().min(0).max(100),
  override_applied: z.boolean().optional(),
  override_id: z.string().optional(),
}).passthrough();

interface ParsedInput {
  readonly applicantId?: string;
  readonly answers: RiskProfileAnswers;
}

/**
 * Validates the definition-driven input envelope.
 */
export function parseEvaluationInput(
  definition: RiskProfileDefinition,
  input: RiskProfileEvaluationInput | Record<string, unknown>,
): ParsedInput {
  const candidate = RiskProfileEvaluationInputSchema.parse(input);
  const answers = createAnswersSchema(definition).parse(
    candidate.answers,
  ) as RiskProfileAnswers;
  return {
    ...(candidate.applicantId !== undefined && {
      applicantId: candidate.applicantId,
    }),
    answers,
  };
}

/**
 * Maps public answer IDs to the field names used by generated JDM graphs.
 */
export function toJdmInput(answers: RiskProfileAnswers): Record<string, AnswerValue> {
  return Object.fromEntries(
    Object.entries(answers).map(([key, value]) => [toSnakeCase(key), value]),
  );
}

/**
 * Validates a standard-contract JDM response and enriches it with domain metadata.
 */
export function fromJdmResult(
  raw: unknown,
  definition: RiskProfileDefinition,
  graphChecksum: string,
  applicantId?: string,
): EvaluationResult {
  const parsed = ModernJdmResultSchema.parse(raw);

  const profile = definition.profiles.find(
    (candidate) => candidate.id === parsed.profile_id,
  );
  if (profile === undefined) {
    throw new Error(
      `[invespro-core] JDM returned undeclared profile id "${parsed.profile_id}".`,
    );
  }

  const allocation = definition.allocations[profile.id];
  if (allocation === undefined) {
    throw new Error(
      `[invespro-core] No allocation is declared for profile "${profile.id}".`,
    );
  }

  const scores = Object.fromEntries(
    definition.scoring.flatMap((factor) => {
      const value = parsed[scoreField(factor.questionId)];
      return typeof value === 'number' ? [[factor.questionId, value]] : [];
    }),
  );
  const normalizedScore = roundScore(parsed.normalized_score);

  return {
    ...(applicantId !== undefined && { applicantId }),
    ...(Object.keys(scores).length === definition.scoring.length && { scores }),
    rawScore: parsed.raw_score,
    normalizedScore,
    profile: {
      id: profile.id,
      label: profile.label,
      ...(profile.description !== undefined && {
        description: profile.description,
      }),
    },
    overrideApplied: parsed.override_applied ?? false,
    ...(parsed.override_id !== undefined && { overrideId: parsed.override_id }),
    allocation,
    evaluatedAt: new Date().toISOString(),
    definition: {
      id: definition.id,
      version: definition.version,
      schemaVersion: definition.schemaVersion,
      graphChecksum,
    },
  };
}

function createAnswersSchema(
  definition: RiskProfileDefinition,
): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};
  for (const question of definition.questions) {
    let schema: z.ZodType;
    if (question.type === 'number') {
      let numberSchema = z.number();
      if (question.min !== undefined) numberSchema = numberSchema.min(question.min);
      if (question.max !== undefined) numberSchema = numberSchema.max(question.max);
      schema = numberSchema;
    } else if (question.type === 'boolean') {
      schema = z.boolean();
    } else {
      const values = question.options?.map((option) => option.value) ?? [];
      schema = z
        .union([z.string(), z.number(), z.boolean()])
        .refine(
          (value) => values.some((candidate) => Object.is(candidate, value)),
          `Expected one of the declared options for "${question.id}".`,
        );
    }
    shape[question.id] = question.required ? schema : schema.optional();
  }
  return z.object(shape).strict();
}

function roundScore(score: number): number {
  return Math.round((score + Number.EPSILON) * 100) / 100;
}
