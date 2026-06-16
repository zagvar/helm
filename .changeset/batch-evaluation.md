---
"@vibedcoder/invespro-types": minor
"@vibedcoder/invespro-core": minor
"@vibedcoder/invespro-hono": minor
"@vibedcoder/invespro-cli": minor
---

Add synchronous batch evaluation with ordered per-item outcomes, partial
validation failures, a Hono `/evaluate/batch` endpoint, and CLI JSON/CSV batch
input and output support. Tighten the pre-release public contract by requiring
the `{ applicantId?, answers }` evaluation envelope and returning only the
modern profile/allocation result fields.
