import { RiskProfilerEngine } from "@vibedcoder/invespro-core";
import type { RiskProfileDefinitionInput } from "@vibedcoder/invespro-types";
import { NextResponse } from "next/server";

type CustomEvaluationPayload = {
  readonly definition?: RiskProfileDefinitionInput;
  readonly input?: Record<string, unknown>;
};

export async function POST(request: Request) {
  let engine: RiskProfilerEngine | undefined;

  try {
    const payload = (await request.json()) as CustomEvaluationPayload;

    if (payload.definition === undefined || payload.input === undefined) {
      throw new Error("Custom evaluation requires definition and input.");
    }

    engine = new RiskProfilerEngine({ definition: payload.definition });
    const result = await engine.evaluate(payload.input);

    return NextResponse.json(result);
  } catch (error) {
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
