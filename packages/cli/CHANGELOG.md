# @vibedcoder/invespro-cli

## 0.1.2

### Patch Changes

- c4fcc04: Add shared definition-aware CSV batch parsing in core and expose CSV batch evaluation through the Hono REST adapter.

  The CLI now uses the shared parser, while the Hono adapter accepts raw CSV at `POST /evaluate/batch/csv` and returns the existing JSON batch result shape.

- Updated dependencies [c4fcc04]
  - @vibedcoder/invespro-core@0.2.0
