"use client";

import { useId, useState } from "react";
import type { RiskProfileDefinition } from "@vibedcoder/invespro-types";
import { BatchEvaluationPanel } from "./evaluation/BatchEvaluationPanel";
import { CustomDefinitionPanel } from "./evaluation/CustomDefinitionPanel";
import { DefinitionPanel } from "./evaluation/DefinitionPanel";
import { DefinitionValidatorPanel } from "./evaluation/DefinitionValidatorPanel";
import { SingleEvaluationPanel } from "./evaluation/SingleEvaluationPanel";

const tabs = [
  {
    id: "single",
    label: "Single Applicant",
  },
  {
    id: "batch",
    label: "Batch Evaluation",
  },
  {
    id: "custom",
    label: "Custom Model",
  },
  {
    id: "definition",
    label: "Active Definition",
  },
  {
    id: "validator",
    label: "Definition Validator",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function DemoTabs({
  activeDefinition,
}: {
  readonly activeDefinition: RiskProfileDefinition;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("single");
  const idPrefix = useId();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        <div
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
          role="tablist"
          aria-label="Invespro demo sections"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                aria-controls={`${idPrefix}-${tab.id}-panel`}
                aria-selected={isActive}
                className={
                  isActive
                    ? "h-11 rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
                    : "h-11 rounded-md px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }
                id={`${idPrefix}-${tab.id}-tab`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-labelledby={`${idPrefix}-${activeTab}-tab`}
        id={`${idPrefix}-${activeTab}-panel`}
        role="tabpanel"
      >
        {activeTab === "single" && <SingleEvaluationPanel />}
        {activeTab === "batch" && <BatchEvaluationPanel />}
        {activeTab === "custom" && <CustomDefinitionPanel />}
        {activeTab === "definition" && (
          <DefinitionPanel definition={activeDefinition} />
        )}
        {activeTab === "validator" && (
          <DefinitionValidatorPanel initialDefinition={activeDefinition} />
        )}
      </div>
    </section>
  );
}
