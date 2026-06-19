import { describe, expect, it } from "vitest";
import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/evaluate/custom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("custom evaluation API route", () => {
  const definition = {
    schemaVersion: "1.0",
    id: "demoCustomProfiler",
    name: "Demo Custom Profiler",
    version: "0.1.0",
    questions: [
      {
        id: "horizonYears",
        text: "How long is the investment horizon?",
        type: "number",
        required: true,
        min: 0,
        max: 30,
      },
    ],
    scoring: [
      {
        questionId: "horizonYears",
        weight: 1,
        rules: [
          { type: "range", max: 5, score: 2 },
          { type: "range", min: 5, score: 10 },
        ],
      },
    ],
    profiles: [
      { id: "defensive", label: "Defensive", order: 0 },
      { id: "growth", label: "Growth", order: 1 },
    ],
    scoreBands: [
      { profileId: "defensive", minScore: 0 },
      { profileId: "growth", minScore: 50 },
    ],
    assetClasses: [
      { id: "equities", label: "Equities" },
      { id: "cash", label: "Cash" },
    ],
    allocations: {
      defensive: { equities: 30, cash: 70 },
      growth: { equities: 80, cash: 20 },
    },
    overrides: [],
  };

  it("returns structured validation details for malformed payloads", async () => {
    const response = await POST(request({ definition }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "validation_error",
        message: "Invalid custom evaluation payload.",
        details: {
          fieldErrors: {
            input: expect.arrayContaining([expect.any(String)]),
          },
        },
      },
    });
  });

  it("returns structured validation details for invalid custom answers", async () => {
    const response = await POST(
      request({
        definition,
        input: {
          applicantId: "CUSTOM-INVALID",
          answers: {
            horizonYears: 99,
          },
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      error: {
        code: "validation_error",
        details: {
          fieldErrors: {
            horizonYears: expect.arrayContaining([expect.any(String)]),
          },
        },
      },
    });
  });
});
