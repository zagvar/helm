import { RiskProfilerEngine } from "@vibedcoder/invespro-core";
import { RiskProfileDefinitionSchema } from "@vibedcoder/invespro-types";
import { NextResponse } from "next/server";

type FlattenableValidationError = {
  readonly flatten: () => unknown;
};

export async function POST(request: Request) {
  let engine: RiskProfilerEngine | undefined;

  try {
    const payload = parseCustomEvaluationPayload(await request.json());

    engine = new RiskProfilerEngine({ definition: payload.definition });
    const result = await engine.evaluate(payload.input);

    return NextResponse.json(result);
  } catch (error) {
    if (isFlattenableValidationError(error)) {
      return NextResponse.json(
        {
          error: {
            code: "validation_error",
            message: "Invalid custom evaluation payload.",
            details: error.flatten(),
          },
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "custom_evaluation_error",
          message:
            error instanceof Error
              ? error.message
              : "Custom evaluation failed.",
        },
      },
      { status: 400 },
    );
  } finally {
    engine?.dispose();
  }
}

function parseCustomEvaluationPayload(payload: unknown) {
  if (!isRecord(payload)) {
    throw createValidationError({
      formErrors: ["Custom evaluation payload must be a JSON object."],
      fieldErrors: {},
    });
  }

  const fieldErrors: Record<string, string[]> = {};
  if (!("definition" in payload)) {
    fieldErrors.definition = ["Required"];
  }
  if (!("input" in payload)) {
    fieldErrors.input = ["Required"];
  } else if (!isRecord(payload.input)) {
    fieldErrors.input = ["Expected input to be a JSON object."];
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw createValidationError({ formErrors: [], fieldErrors });
  }

  const definition = RiskProfileDefinitionSchema.safeParse(
    payload.definition,
  );
  if (!definition.success) {
    throw definition.error;
  }

  return {
    definition: definition.data,
    input: payload.input,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFlattenableValidationError(
  error: unknown,
): error is FlattenableValidationError {
  return (
    isRecord(error) &&
    typeof error.flatten === "function"
  );
}

function createValidationError(details: unknown): FlattenableValidationError {
  return {
    flatten: () => details,
  };
}
