import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RiskProfileDefinition } from "@vibedcoder/invespro-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BatchEvaluationPanel } from "./BatchEvaluationPanel";
import { CustomDefinitionPanel } from "./CustomDefinitionPanel";
import { DefinitionPanel } from "./DefinitionPanel";
import { DefinitionValidatorPanel } from "./DefinitionValidatorPanel";
import { SingleEvaluationPanel } from "./SingleEvaluationPanel";

const evaluationResult = {
  applicantId: "APP-001",
  scores: {
    investmentHorizonYears: 7,
    riskAttitude: 7,
  },
  rawScore: 38,
  normalizedScore: 67.86,
  profile: {
    id: "moderatelyAggressive",
    label: "Moderately Aggressive",
  },
  overrideApplied: false,
  allocation: {
    equities: 70,
    fixedIncome: 20,
    cash: 5,
    alternatives: 5,
  },
  evaluatedAt: "2026-06-16T00:00:00.000Z",
  definition: {
    id: "invesproDefaultRiskProfiler",
    version: "0.1.0",
    schemaVersion: "1.0",
    graphChecksum: "sha256:test",
  },
};

const batchResult = {
  items: [
    {
      index: 0,
      applicantId: "APP-001",
      status: "fulfilled",
      result: evaluationResult,
    },
  ],
  summary: {
    total: 1,
    fulfilled: 1,
    rejected: 0,
  },
};

const customEvaluationResult = {
  applicantId: "CUSTOM-001",
  scores: {
    downturnResponse: 10,
    horizonYears: 10,
    investmentGoal: 10,
  },
  rawScore: 30,
  normalizedScore: 100,
  profile: {
    id: "growth",
    label: "Growth",
  },
  overrideApplied: false,
  allocation: {
    equities: 80,
    fixedIncome: 15,
    cash: 5,
  },
  evaluatedAt: "2026-06-16T00:00:00.000Z",
  definition: {
    id: "demoCustomProfiler",
    version: "0.1.0",
    schemaVersion: "1.0",
    graphChecksum: "sha256:custom",
  },
};

const definition = {
  schemaVersion: "1.0",
  id: "invesproDefaultRiskProfiler",
  name: "Invespro Default Investment Risk Profiler",
  version: "0.1.0",
  currency: "AUD",
  questions: [],
  scoring: [],
  profiles: [
    { id: "conservative", label: "Conservative", order: 0 },
    { id: "moderate", label: "Moderate", order: 1 },
  ],
  scoreBands: [
    { profileId: "moderate", minScore: 50 },
    { profileId: "conservative", minScore: 0 },
  ],
  assetClasses: [
    { id: "equities", label: "Equities" },
    { id: "cash", label: "Cash" },
  ],
  allocations: {
    conservative: { equities: 20, cash: 80 },
    moderate: { equities: 60, cash: 40 },
  },
  overrides: [],
} as RiskProfileDefinition;

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

describe("evaluation demo panels", () => {
  const writeText = vi.fn<() => Promise<void>>();

  beforeEach(() => {
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("copies and submits a single evaluation request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(evaluationResult));
    vi.stubGlobal("fetch", fetchMock);

    render(<SingleEvaluationPanel />);

    await userEvent.click(
      screen.getByRole("button", { name: /copy request/i }),
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('"investmentHorizonYears": 10'),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /evaluate profile/i }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/evaluate",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      await screen.findByText("Moderately Aggressive"),
    ).toBeInTheDocument();
    expect(screen.getByText("Score breakdown")).toBeInTheDocument();
  });

  it("copies and submits the batch request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(batchResult));
    vi.stubGlobal("fetch", fetchMock);

    render(<BatchEvaluationPanel />);

    await userEvent.click(
      screen.getByRole("button", { name: /copy request/i }),
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('"items"'),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /evaluate batch/i }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/evaluate/batch",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("fulfilled")).toBeInTheDocument();
  });

  it("submits a custom definition and applicant answers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(customEvaluationResult));
    vi.stubGlobal("fetch", fetchMock);

    render(<CustomDefinitionPanel />);

    expect(screen.getByDisplayValue(/demoCustomProfiler/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/CUSTOM-001/)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /evaluate custom model/i }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/evaluate/custom",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Growth")).toBeInTheDocument();
  });

  it("loads and displays the active definition", async () => {
    render(<DefinitionPanel definition={definition} />);

    expect(
      screen.getByText("Invespro Default Investment Risk Profiler"),
    ).toBeInTheDocument();
    expect(screen.getByText("Allocation map")).toBeInTheDocument();
  });

  it("validates a definition JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ valid: true, definition }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DefinitionValidatorPanel initialDefinition={definition} />);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(/invesproDefaultRiskProfiler/),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /validate definition/i }),
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/definitions/validate",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Definition is valid.")).toBeInTheDocument();
  });
});
