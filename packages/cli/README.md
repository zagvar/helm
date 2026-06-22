# @zagvar/helm-cli

Command-line interface for Helm, a rules-based investment profiling and
portfolio allocation engine.

Use this package to evaluate JSON or CSV inputs, compile definitions to JDM,
validate JDM graphs, or run an interactive profiling flow.

## Installation

```sh
pnpm add -g @zagvar/helm-cli
```

```sh
npm install -g @zagvar/helm-cli
```

You can also run it without a global install:

```sh
npx @zagvar/helm-cli --help
```

## Evaluate One Applicant

```sh
zagvar-helm evaluate input.json --output json
```

Example input:

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

## Batch Evaluation

JSON batch:

```sh
zagvar-helm evaluate-batch applicants.json --output json
```

CSV batch:

```sh
zagvar-helm evaluate-batch applicants.csv --input-format csv --output csv
```

Example CSV:

```csv
applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience
APP-001,10,hold,balanced_growth,75000,20,4,intermediate
```

## Interactive Profiling

```sh
zagvar-helm profile
```

## Custom Definitions and JDM Graphs

Compile a definition to a ZenEngine/Gorules JDM graph:

```sh
zagvar-helm compile definition.json --output graph.json
```

Validate a JDM graph:

```sh
zagvar-helm validate graph.json
```

Validate a graph against a custom definition contract:

```sh
zagvar-helm validate graph.json --definition definition.json --input sample-input.json
```

Evaluate with a custom definition:

```sh
zagvar-helm evaluate input.json --definition definition.json --output json
```

## Related Packages

- `@zagvar/helm-core` runs the evaluation engine.
- `@zagvar/helm-types` provides schemas and types.
- `@zagvar/helm-hono` exposes the engine through REST.

Full documentation: [helmdoc.vercel.app](https://helmdoc.vercel.app/).
