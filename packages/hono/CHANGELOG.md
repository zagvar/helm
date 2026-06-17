# @vibedcoder/invespro-hono

## 0.2.1

### Patch Changes

- Replace published workspace dependency ranges with npm-installable semver ranges.
- Updated dependencies
  - @vibedcoder/invespro-core@0.2.1

## 0.2.0

### Minor Changes

- c4fcc04: Add shared definition-aware CSV batch parsing in core and expose CSV batch evaluation through the Hono REST adapter.

  The CLI now uses the shared parser, while the Hono adapter accepts raw CSV at `POST /evaluate/batch/csv` and returns the existing JSON batch result shape.

### Patch Changes

- Updated dependencies [c4fcc04]
  - @vibedcoder/invespro-core@0.2.0
