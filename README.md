# invespro

Rules-based investment profiling and portfolio allocation engine for Node.js
services, REST APIs, and command-line workflows.

`invespro` helps fintech teams collect applicant answers, evaluate a versioned
risk model, assign an investment risk profile, and return a suitable portfolio
allocation. It provides an opinionated default model backed by
[ZEN Engine](https://gorules.io/zen/), while still allowing teams to customize
questions, scores, profile bands, asset classes, allocations, and override
rules through a versioned JSON definition.

It is designed for systems that need reusable investment profiling and
allocation decisions: embed it directly in a Node service, expose it through the
Hono REST adapter, or run it from the CLI for operations and data workflows.

Try the live demo at [invespro.vercel.app](https://invespro.vercel.app/).

> This project provides software primitives for investment profiling and
> allocation. It is not financial advice, and production users remain
> responsible for regulatory, suitability, audit, and disclosure requirements in
> their jurisdiction.

## Contents

- [Features](#features)
- [Packages](#packages)
- [Demo App](#demo-app)
- [Installation](#installation)
- [Default Model](#default-model)
- [Core Usage](#core-usage)
- [Batch Evaluation](#batch-evaluation)
- [CLI Usage](#cli-usage)
- [REST API With Hono](#rest-api-with-hono)
- [Customization](#customization)
- [Expert Custom JDM Mode](#expert-custom-jdm-mode)
- [Current Limits](#current-limits)
- [Development](#development)
- [Release Notes](#release-notes)
- [License](#license)

## Features

- Default investment profiling and allocation model with seven scored factors.
- Deterministic JDM graph generation from versioned definitions.
- Zod schemas and TypeScript types for definitions, inputs, and outputs.
- Normalized weighted scoring from `0` to `100`.
- Configurable profiles, score bands, asset classes, allocations, and overrides.
- Suitable asset allocation returned for every successful profile result.
- Single applicant and batch evaluation.
- Ordered batch results with per-item success or validation failure.
- REST adapter for Hono.
- CLI for interactive profiling, JSON evaluation, CSV batch input, and JDM validation.
- Graph checksum and definition metadata included in every result.
- Expert mode for externally authored JDM graphs that follow the Invespro contract.
- Hosted Next.js demo for single, batch, default-definition, validation, and custom-definition flows.

## Packages

| Package | Purpose |
| --- | --- |
| `@vibedcoder/invespro-types` | Public Zod schemas and TypeScript contracts. |
| `@vibedcoder/invespro-core` | ZEN-backed profiling engine, compiler, loader helpers, and default definition. |
| `@vibedcoder/invespro-hono` | Mountable Hono REST adapter. |
| `@vibedcoder/invespro-cli` | CLI for interactive, JSON, CSV, compile, and validate workflows. |

The package split is intentional:

- Use `types` when another system only needs the public contracts.
- Use `core` when embedding profiling directly in a Node service.
- Use `hono` when exposing profiling over HTTP.
- Use `cli` for local workflows, batch files, demos, and operational tooling.

## Demo App

The hosted demo is available at
[https://invespro.vercel.app/](https://invespro.vercel.app/).

It demonstrates:

- Single-applicant evaluation against the default model.
- Batch evaluation with ordered per-item results.
- The active default definition, profiles, score bands, and allocations.
- Definition validation against the public schema.
- A custom model example where questions, answer options, weights, score bands,
  and allocations are changed without writing a custom JDM graph.

The demo lives in `apps/demo` and uses the workspace packages via
`workspace:*`. In local development and on Vercel, the demo build must compile
its workspace dependencies first so `@vibedcoder/invespro-types` and
`@vibedcoder/invespro-core` have fresh `dist` outputs.

Local demo commands:

```bash
pnpm demo:dev
pnpm demo:build
```

The Vercel project uses `apps/demo` as the root directory with these commands:

```bash
corepack enable && corepack pnpm --version && corepack pnpm install --frozen-lockfile
corepack pnpm --filter @invespro/demo... build
```

## Installation

Install the package or packages needed by your integration:

```bash
pnpm add @vibedcoder/invespro-core
pnpm add @vibedcoder/invespro-hono hono
pnpm add -D @vibedcoder/invespro-cli
```

For local development inside this repository:

```bash
pnpm install
pnpm build
```

The workspace targets Node.js `>=24.0.0` and pnpm `>=11.0.0`.

## Default Model

The bundled definition is exported as `DEFAULT_RISK_PROFILE_DEFINITION`.

It includes:

- Seven scored questions.
- Five risk profiles.
- Four asset classes.
- One debt-to-income override.
- AUD as the default currency.
- Normalized scoring from `0` to `100`.

### Default Questions

| ID | Type | Purpose |
| --- | --- | --- |
| `investmentHorizonYears` | number | Scored |
| `riskAttitude` | select | Scored |
| `investmentObjective` | select | Scored |
| `annualIncome` | number | Scored |
| `dtiRatio` | number | Scored and override input |
| `liquidityMonths` | number | Scored |
| `investmentExperience` | select | Scored |

### Default Profiles

| ID | Label |
| --- | --- |
| `conservative` | Conservative |
| `moderatelyConservative` | Moderately Conservative |
| `moderate` | Moderate |
| `moderatelyAggressive` | Moderately Aggressive |
| `aggressive` | Aggressive |

### Default Asset Classes

| ID | Label |
| --- | --- |
| `equities` | Equities |
| `fixedIncome` | Fixed Income |
| `cash` | Cash |
| `alternatives` | Alternatives |

### Default Select Values

| Question | Allowed values |
| --- | --- |
| `riskAttitude` | `buy_more`, `hold`, `sell_some`, `sell_all` |
| `investmentObjective` | `maximum_growth`, `balanced_growth`, `income_generation`, `capital_preservation` |
| `investmentExperience` | `experienced`, `intermediate`, `beginner`, `none` |

### Default Override

If `dtiRatio >= 50`, the applicant is assigned the `conservative` profile
regardless of their calculated score.

## Core Usage

Use `RiskProfilerEngine` when embedding profiling directly in a Node service.

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';

const engine = new RiskProfilerEngine();

try {
  const result = await engine.evaluate({
    applicantId: 'APP-001',
    answers: {
      investmentHorizonYears: 10,
      riskAttitude: 'hold',
      investmentObjective: 'balanced_growth',
      annualIncome: 75000,
      dtiRatio: 20,
      liquidityMonths: 4,
      investmentExperience: 'intermediate',
    },
  });

  console.log(result.profile.label);
  console.log(result.normalizedScore);
  console.log(result.allocation);
} finally {
  engine.dispose();
}
```

The single-applicant input envelope is always:

```json
{
  "applicantId": "APP-001",
  "answers": {
    "investmentHorizonYears": 10,
    "riskAttitude": "hold",
    "investmentObjective": "balanced_growth",
    "annualIncome": 75000,
    "dtiRatio": 20,
    "liquidityMonths": 4,
    "investmentExperience": "intermediate"
  }
}
```

For custom definitions, the keys inside `answers` come from the active
definition's question IDs.

### Example Result

```json
{
  "applicantId": "APP-001",
  "rawScore": 38,
  "normalizedScore": 67.86,
  "profile": {
    "id": "moderatelyAggressive",
    "label": "Moderately Aggressive"
  },
  "overrideApplied": false,
  "allocation": {
    "equities": 70,
    "fixedIncome": 20,
    "cash": 5,
    "alternatives": 5
  },
  "definition": {
    "id": "invesproDefaultRiskProfiler",
    "version": "0.1.0",
    "schemaVersion": "1.0",
    "graphChecksum": "sha256:..."
  }
}
```

## Batch Evaluation

Use `evaluateMany` for synchronous batch evaluation.

```ts
const batch = await engine.evaluateMany({
  items: [
    {
      applicantId: 'APP-001',
      answers: {
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 75000,
        dtiRatio: 20,
        liquidityMonths: 4,
        investmentExperience: 'intermediate',
      },
    },
    {
      applicantId: 'APP-002',
      answers: {
        dtiRatio: 150
      },
    },
  ],
});

console.log(batch.summary);
```

Batch evaluation preserves input order. Each item is either `fulfilled` or
`rejected`, so one invalid applicant does not fail the whole batch by default.

```json
{
  "items": [
    {
      "index": 0,
      "applicantId": "APP-001",
      "status": "fulfilled",
      "result": {}
    },
    {
      "index": 1,
      "applicantId": "APP-002",
      "status": "rejected",
      "error": {
        "code": "validation_error",
        "message": "Invalid evaluation input.",
        "details": {}
      }
    }
  ],
  "summary": {
    "total": 2,
    "fulfilled": 1,
    "rejected": 1
  }
}
```

Options:

```ts
await engine.evaluateMany(batchInput, {
  maxBatchSize: 100,
  continueOnError: true,
});
```

The current implementation is synchronous and sequential. It is intended for
request-sized batches, imports, and operational workflows, not long-running job
queues.

## CLI Usage

The CLI is exposed as `invespro`.

```bash
invespro --help
```

### Interactive Profile

Runs the active questionnaire in the terminal.

```bash
invespro profile
invespro profile --output json
invespro profile --definition model.json
```

### Evaluate One Applicant

```bash
invespro evaluate --input applicant.json
invespro evaluate --input applicant.json --output json
invespro evaluate --input applicant.json --definition model.json
invespro evaluate --input applicant.json --definition model.json --jdm-path model.jdm.json
```

`applicant.json`:

```json
{
  "applicantId": "APP-001",
  "answers": {
    "investmentHorizonYears": 10,
    "riskAttitude": "hold",
    "investmentObjective": "balanced_growth",
    "annualIncome": 75000,
    "dtiRatio": 20,
    "liquidityMonths": 4,
    "investmentExperience": "intermediate"
  }
}
```

### Evaluate a Batch From JSON

```bash
invespro evaluate-batch --input applicants.json --output json
```

`applicants.json` may be an array:

```json
[
  {
    "applicantId": "APP-001",
    "answers": {
      "investmentHorizonYears": 10,
      "riskAttitude": "hold",
      "investmentObjective": "balanced_growth",
      "annualIncome": 75000,
      "dtiRatio": 20,
      "liquidityMonths": 4,
      "investmentExperience": "intermediate"
    }
  }
]
```

Or an envelope:

```json
{
  "items": [
    {
      "applicantId": "APP-001",
      "answers": {
        "investmentHorizonYears": 10,
        "riskAttitude": "hold",
        "investmentObjective": "balanced_growth",
        "annualIncome": 75000,
        "dtiRatio": 20,
        "liquidityMonths": 4,
        "investmentExperience": "intermediate"
      }
    }
  ]
}
```

### Evaluate a Batch From CSV

CSV is supported by the CLI as an import/export convenience format.

```bash
invespro evaluate-batch --input applicants.csv --output json
invespro evaluate-batch --input applicants.csv --output csv
```

`applicants.csv`:

```csv
applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience
APP-001,10,hold,balanced_growth,75000,20,4,intermediate
APP-002,20,buy_more,maximum_growth,180000,50,8,experienced
```

CSV rules:

- Use one column per question ID.
- Include `applicantId` when you want it echoed in results.
- Number questions are parsed as numbers.
- Boolean questions accept `true`, `false`, `yes`, `no`, `1`, and `0`.
- Select questions should use the option value, not the display label.
- Empty cells are omitted from the answers object.

CSV output is a flat report with profile, score, allocation, and error columns.

### Compile a Definition to JDM

```bash
invespro compile --definition model.json --output model.jdm.json
```

Use this when you want to inspect, archive, or deploy the generated JDM graph
separately.

### Validate a JDM Graph

```bash
invespro validate --jdm model.jdm.json
invespro validate --jdm model.jdm.json --definition model.json
invespro validate --jdm model.jdm.json --definition model.json --input applicant.json
```

Validation checks:

- The file is valid JSON.
- The file has JDM-like `nodes` and `edges`.
- ZenEngine can load and validate the graph.
- When `--input` is supplied, the graph satisfies the runtime Invespro contract.

## REST API With Hono

Use `@vibedcoder/invespro-hono` to mount the service in a Hono app.

```ts
import { Hono } from 'hono';
import { createRiskProfilerService } from '@vibedcoder/invespro-hono';

const app = new Hono();
const profiler = createRiskProfilerService({
  maxBatchSize: 100,
});

app.route('/risk-profiler', profiler.app);

// Call this from the host application's shutdown hook.
profiler.dispose();
```

If your application already owns the engine:

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const engine = new RiskProfilerEngine({ definition });
const app = createRiskProfilerApp({
  engine,
  maxBatchSize: 100,
});
```

### Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check. |
| `GET` | `/definition` | Active risk profile definition. |
| `GET` | `/questions` | Active questionnaire. |
| `POST` | `/evaluate` | Evaluate one applicant. |
| `POST` | `/evaluate/batch` | Evaluate multiple applicants. |
| `POST` | `/definitions/validate` | Validate a definition payload. |

### POST /evaluate

Request:

```json
{
  "applicantId": "APP-001",
  "answers": {
    "investmentHorizonYears": 10,
    "riskAttitude": "hold",
    "investmentObjective": "balanced_growth",
    "annualIncome": 75000,
    "dtiRatio": 20,
    "liquidityMonths": 4,
    "investmentExperience": "intermediate"
  }
}
```

### POST /evaluate/batch

Request:

```json
{
  "items": [
    {
      "applicantId": "APP-001",
      "answers": {
        "investmentHorizonYears": 10,
        "riskAttitude": "hold",
        "investmentObjective": "balanced_growth",
        "annualIncome": 75000,
        "dtiRatio": 20,
        "liquidityMonths": 4,
        "investmentExperience": "intermediate"
      }
    }
  ]
}
```

The adapter returns `400` for invalid JSON, `422` for invalid input, and `500`
for unexpected evaluation failures.

## Customization

Customization is definition-driven. A definition declares the business contract,
and core compiles it into a deterministic JDM graph.

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';

const engine = new RiskProfilerEngine({
  definition,
});
```

### What You Can Customize

- Definition ID, name, version, and currency.
- Questions.
- Question order.
- Question text and hints.
- Question types: `select`, `number`, and `boolean`.
- Question purposes: `scored`, `informational`, and `override`.
- Select options and option values.
- Numeric min/max bounds.
- Scoring rules for options and numeric ranges.
- Relative factor weights.
- Risk profile IDs, labels, descriptions, and ordering.
- Normalized score bands from `0` to `100`.
- Asset class IDs, labels, and descriptions.
- Allocation percentages per profile.
- Override rules that force a profile when a condition matches.

### What Is Intentionally Constrained

- IDs must be lower camel case, for example `riskCapacity`.
- Every scored question must be required.
- Every scored question must have exactly one scoring factor.
- Informational questions are collected and validated but not scored by the
  generated graph.
- Numeric score ranges must cover all possible values without gaps or overlaps.
- Select and boolean scoring must cover all declared values.
- Every profile must have one score band.
- Score bands use normalized `0` to `100` thresholds.
- Every profile must have an allocation.
- Allocations must use declared asset classes and sum to `100`.
- Generated JDM always returns a profiled applicant, not an eligibility status.
- Custom JDM must follow the Invespro input and output contract.

These constraints are deliberate. They keep the system customizable without
becoming an arbitrary decision-graph host. Teams that need fully arbitrary
decisioning can still author their own JDM and use expert mode.

### Minimal Custom Definition

```json
{
  "schemaVersion": "1.0",
  "id": "simpleRiskProfiler",
  "name": "Simple Risk Profiler",
  "version": "1.0.0",
  "currency": "AUD",
  "questions": [
    {
      "id": "riskCapacity",
      "text": "Risk capacity from 0 to 10",
      "type": "number",
      "min": 0,
      "max": 10,
      "purpose": "scored"
    },
    {
      "id": "needsEmergencyAccess",
      "text": "Does the applicant need emergency access?",
      "type": "boolean",
      "purpose": "override"
    },
    {
      "id": "adviserNote",
      "text": "Adviser note",
      "type": "select",
      "required": false,
      "purpose": "informational",
      "options": [
        {
          "label": "None",
          "value": "none"
        },
        {
          "label": "Review manually",
          "value": "review_manually"
        }
      ]
    }
  ],
  "scoring": [
    {
      "questionId": "riskCapacity",
      "weight": 1,
      "rules": [
        {
          "type": "range",
          "min": 7,
          "score": 10
        },
        {
          "type": "range",
          "min": 4,
          "max": 7,
          "score": 5
        },
        {
          "type": "range",
          "max": 4,
          "score": 1
        }
      ]
    }
  ],
  "profiles": [
    {
      "id": "capitalCare",
      "label": "Capital Care",
      "order": 0
    },
    {
      "id": "longTermGrowth",
      "label": "Long-term Growth",
      "order": 1
    }
  ],
  "scoreBands": [
    {
      "profileId": "longTermGrowth",
      "minScore": 70
    },
    {
      "profileId": "capitalCare",
      "minScore": 0
    }
  ],
  "assetClasses": [
    {
      "id": "growthAssets",
      "label": "Growth Assets"
    },
    {
      "id": "defensiveAssets",
      "label": "Defensive Assets"
    }
  ],
  "allocations": {
    "capitalCare": {
      "growthAssets": 20,
      "defensiveAssets": 80
    },
    "longTermGrowth": {
      "growthAssets": 80,
      "defensiveAssets": 20
    }
  },
  "overrides": [
    {
      "id": "emergencyAccessOverride",
      "questionId": "needsEmergencyAccess",
      "operator": "==",
      "value": true,
      "profileId": "capitalCare"
    }
  ]
}
```

Evaluate against it:

```ts
const engine = new RiskProfilerEngine({ definition });

const result = await engine.evaluate({
  applicantId: 'APP-100',
  answers: {
    riskCapacity: 8,
    needsEmergencyAccess: false,
    adviserNote: 'none',
  },
});
```

### Scoring Model

Each scored factor has its own raw score scale. The compiler normalizes each
factor by its maximum score, applies the factor weight, and produces a final
score from `0` to `100`.

Conceptually:

```text
normalized_score =
  sum((factor_score / factor_max_score) * factor_weight)
  / total_weight
  * 100
```

This allows one question to use a `0..10` scale and another to use a `0..4`
scale while weights still express relative importance.

### Definitions and Auditability

Every successful result includes:

- `definition.id`
- `definition.version`
- `definition.schemaVersion`
- `definition.graphChecksum`

This lets downstream systems store which rules produced a decision.

## Expert Custom JDM Mode

You can supply your own JDM loader instead of using the generated graph.

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';

const engine = new RiskProfilerEngine({
  definition,
  loader: async () => Buffer.from(customJdmJson),
  graphChecksum: 'sha256:...',
});
```

The custom JDM may use any internal graph topology, but it must follow the
Invespro boundary contract.

### Input Contract

Public question IDs are lower camel case:

```json
{
  "riskCapacity": 8
}
```

At the JDM boundary they are converted to snake case:

```json
{
  "risk_capacity": 8
}
```

### Output Contract

The JDM must return:

```json
{
  "profile_id": "capitalCare",
  "raw_score": 5,
  "normalized_score": 50,
  "override_applied": false
}
```

Optional fields:

```json
{
  "override_id": "emergencyAccessOverride",
  "risk_capacity_score": 5
}
```

Core rejects malformed outputs and undeclared profile IDs before adapters return
the response to consumers.

## Current Limits

The current design is intentionally opinionated.

- No eligibility status yet. Successful evaluations return a profile and
  allocation. A future model may introduce outcomes such as `profiled` and
  `ineligible`.
- No background jobs or queues. Batch evaluation is synchronous.
- No streaming CSV processing yet. CSV files are read as a single file by the
  CLI.
- No concurrent batch execution yet. Items are evaluated sequentially to keep
  ZenEngine usage conservative.
- No automatic persistence. Store results in your own application database.
- No hosted server binary yet. The Hono adapter is meant to be mounted inside a
  host application.
- No arbitrary schema-free question model. Customization happens through the
  versioned definition schema.

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Useful package commands:

```bash
pnpm demo:dev
pnpm demo:build
pnpm --filter @vibedcoder/invespro-core test
pnpm --filter @vibedcoder/invespro-hono test
pnpm --filter @vibedcoder/invespro-cli exec tsx --tsconfig tsconfig.dev.json src/index.ts --help
```

The workspace uses:

- pnpm workspaces.
- TypeScript project references.
- tsdown for package builds.
- Vitest for tests.
- ESLint for linting.
- Changesets for release management.
- Next.js for the hosted demo app.

## Release Notes

Changes are tracked with Changesets. Add a changeset for user-facing package
changes:

```bash
pnpm changeset
```

Then version and publish:

```bash
pnpm version-packages
pnpm release
```

## License

MIT - see [LICENSE](./LICENSE).
