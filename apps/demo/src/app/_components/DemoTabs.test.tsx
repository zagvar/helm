import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RiskProfileDefinition } from "@vibedcoder/invespro-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoTabs } from "./DemoTabs";

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

describe("DemoTabs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the main demo sections as tabs in the expected order", () => {
    render(<DemoTabs activeDefinition={definition} />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Single Applicant",
      "Batch Evaluation",
      "Custom Model",
      "Active Definition",
      "Definition Validator",
    ]);
    expect(
      screen.getByRole("tab", { name: "Single Applicant", selected: true }),
    ).toBeInTheDocument();
  });

  it("switches between demo sections", async () => {
    render(<DemoTabs activeDefinition={definition} />);

    await userEvent.click(
      screen.getByRole("tab", { name: "Batch Evaluation" }),
    );
    expect(
      screen.getByRole("heading", { name: "Batch Evaluation" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Custom Model" }));
    expect(
      screen.getByRole("heading", { name: "Custom Model" }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("tab", { name: "Active Definition" }),
    );
    expect(
      screen.getByText("Invespro Default Investment Risk Profiler"),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("tab", { name: "Definition Validator" }),
    );
    expect(
      screen.getByRole("heading", { name: "Definition Validator" }),
    ).toBeInTheDocument();
  });
});
