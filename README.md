# helm

Rules-based investment profiling and portfolio allocation for Node.js services,
REST APIs, and command-line workflows.

Helm evaluates applicant answers against a versioned risk model and returns
a normalized score, risk profile, portfolio allocation, and definition metadata
for auditability. It ships with a default profiling model and supports custom
definitions when your questions, scoring, bands, overrides, or allocations need
to match a specific policy.

Learn more in the [documentation](https://helmdoc.vercel.app/docs), or
[try the interactive demo](https://helmdoc.vercel.app/demo).

> This project provides software primitives for investment profiling and
> allocation. It is not financial advice. Production users remain responsible
> for regulatory, suitability, audit, and disclosure requirements in their
> jurisdiction.

## Packages

| Package              | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `@zagvar/helm-core`  | Main engine, default definition, compiler, CSV parser, batch evaluation. |
| `@zagvar/helm-hono`  | REST API adapter for Hono services.                                      |
| `@zagvar/helm-cli`   | Command-line evaluation, validation, and compilation.                    |
| `@zagvar/helm-types` | Shared Zod schemas and TypeScript types.                                 |

Use `core` when embedding profiling directly in a service, `hono` when another
system should call the engine over HTTP, `cli` for local or operational
workflows, and `types` when you only need validation contracts.

## Installation

Install only the package or packages your integration needs:

```bash
pnpm add @zagvar/helm-core
pnpm add @zagvar/helm-hono hono
pnpm add -D @zagvar/helm-cli
pnpm add @zagvar/helm-types
```

The workspace targets Node.js `>=24.0.0` and pnpm `>=11.0.0`.

## Quick Start

```ts
import { RiskProfilerEngine } from "@zagvar/helm-core";

const engine = new RiskProfilerEngine();

try {
  const result = await engine.evaluate({
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

  console.log(result.profile.label);
  console.log(result.normalizedScore);
  console.log(result.allocation);
} finally {
  engine.dispose();
}
```

Call `engine.dispose()` when the engine is no longer needed so the underlying
ZenEngine resources are released.

The default model includes seven scored factors, five risk profiles, four asset
classes, and an override that assigns a conservative profile when debt-to-income
ratio is high. See
[Model Concepts](https://helmdoc.vercel.app/docs/model-concepts) for the full
model details.

## Common Workflows

### Core Engine

Use `RiskProfilerEngine` for direct evaluation from a Node.js service. It
supports single-applicant evaluation, ordered batch evaluation, CSV batch
parsing, default definitions, and custom definitions.

See the [core guide](https://helmdoc.vercel.app/docs/guides/core-engine).

### REST API

Mount the Hono adapter when another service should call Helm over HTTP:

```ts
import { serve } from "@hono/node-server";
import { createRiskProfilerService } from "@zagvar/helm-hono";

const service = createRiskProfilerService();

serve({
  fetch: service.app.fetch,
  port: 3000,
});
```

The adapter exposes health, definition, questions, validation, single
evaluation, JSON batch, and CSV batch endpoints.

See the [REST API guide](https://helmdoc.vercel.app/docs/guides/rest-api) and
[endpoint reference](https://helmdoc.vercel.app/docs/reference/rest-endpoints).

### CLI

Use the CLI for local evaluation, CSV workflows, definition compilation, and
JDM graph validation:

```bash
pnpm add --save-dev @zagvar/helm-cli
pnpm exec zagvar-helm --help
pnpm exec zagvar-helm evaluate input.json --output json
pnpm exec zagvar-helm evaluate-batch applicants.csv --input-format csv --output csv
pnpm exec zagvar-helm compile definition.json --output graph.jdm.json
pnpm exec zagvar-helm validate graph.jdm.json --definition definition.json
```

See the [CLI guide](https://helmdoc.vercel.app/docs/guides/cli) and
[CLI reference](https://helmdoc.vercel.app/docs/reference/cli-reference).

### Custom Definitions

Helm is definition-driven. A definition controls questions, scoring,
profiles, score bands, overrides, asset classes, and allocations. Expert users
can also supply custom JDM graphs when they follow the Helm input and
result contract.

See the
[custom definitions guide](https://helmdoc.vercel.app/docs/guides/custom-definitions),
[definition schema reference](https://helmdoc.vercel.app/docs/reference/definition-schema),
and
[expert JDM contract](https://helmdoc.vercel.app/docs/reference/expert-jdm-contract).

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Useful docs commands:

```bash
pnpm docs:dev
pnpm docs:build
```

The workspace uses pnpm workspaces, TypeScript project references, tsdown,
Vitest, ESLint, and a Next.js docs app.

## License

MIT - see [LICENSE](./LICENSE).
