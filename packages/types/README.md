# @zagvar/helm-types

Shared TypeScript types and Zod schemas for Helm, a rules-based investment
profiling and portfolio allocation engine.

Use this package when you want to validate request payloads, custom definition
files, questionnaire answers, or evaluation results without depending on the
core ZenEngine runtime.

## Installation

```sh
pnpm add @zagvar/helm-types
```

```sh
npm install @zagvar/helm-types
```

## Usage

```ts
import {
  RiskProfileEvaluationInputSchema,
  RiskProfileDefinitionSchema,
} from "@zagvar/helm-types";

const input = RiskProfileEvaluationInputSchema.parse({
  applicantId: "APP-001",
  answers: {
    investmentHorizonYears: 10,
    riskAttitude: "hold",
    investmentObjective: "balanced_growth",
    annualIncome: 75000,
    dtiRatio: 20,
    liquidityMonths: 4,
    investmentExperience: "intermediate",
  },
});

const definition = RiskProfileDefinitionSchema.parse(customDefinition);
```

## What It Contains

- Public evaluation input and result schemas.
- Batch evaluation input and result schemas.
- Risk profile definition schemas.
- Questionnaire and answer validation types.
- Profile, allocation, and applicant-related types.

## Related Packages

- `@zagvar/helm-core` runs evaluations.
- `@zagvar/helm-hono` exposes the engine through a Hono REST adapter.
- `@zagvar/helm-cli` provides command-line evaluation and validation.

Full documentation: [helmdoc.vercel.app](https://helmdoc.vercel.app/).
