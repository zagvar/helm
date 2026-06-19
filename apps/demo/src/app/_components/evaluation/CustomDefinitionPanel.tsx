import { useState } from "react";
import type { EvaluationResult } from "@vibedcoder/invespro-types";
import {
  customDefinitionJson,
  customEvaluationJson,
} from "./demo-data";
import { copyText } from "./copy";
import { ErrorDetails } from "./ErrorDetails";
import { Button } from "./fields";
import { stringifyJson } from "./requests";
import { ResultPanel } from "./ResultPanel";

type ApiError = {
  readonly message: string;
  readonly details?: unknown;
};

export function CustomDefinitionPanel() {
  const [definitionJson, setDefinitionJson] = useState(customDefinitionJson);
  const [inputJson, setInputJson] = useState(customEvaluationJson);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const definition = JSON.parse(definitionJson) as unknown;
      const input = JSON.parse(inputJson) as unknown;

      const response = await fetch("/api/evaluate/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ definition, input }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError({
          message: data?.error?.message ?? "Custom evaluation failed.",
          details: data?.error?.details,
        });
        setResult(null);
        return;
      }

      setResult(data);
    } catch (err) {
      setError({
        message:
          err instanceof Error ? err.message : "Custom evaluation failed.",
      });
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyDefinition() {
    await copyText(definitionJson);
    showCopyStatus("Copied definition JSON");
  }

  async function copyRequest() {
    const definition = JSON.parse(definitionJson) as unknown;
    const input = JSON.parse(inputJson) as unknown;
    await copyText(stringifyJson({ definition, input }));
    showCopyStatus("Copied custom request JSON");
  }

  function resetExample() {
    setDefinitionJson(customDefinitionJson);
    setInputJson(customEvaluationJson);
    setResult(null);
    setError(null);
  }

  function showCopyStatus(message: string) {
    setCopyStatus(message);
    window.setTimeout(() => setCopyStatus(null), 2000);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Custom Model
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Edit a versioned Invespro definition and applicant answers, then
            evaluate them without writing a custom JDM graph.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Definition JSON
            <textarea
              className="mt-2 min-h-96 w-full rounded-md border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              onChange={(event) => setDefinitionJson(event.target.value)}
              spellCheck={false}
              value={definitionJson}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Applicant Answers JSON
            <textarea
              className="mt-2 min-h-96 w-full rounded-md border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              onChange={(event) => setInputJson(event.target.value)}
              spellCheck={false}
              value={inputJson}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            disabled={isSubmitting}
            label="Evaluate custom model"
            loadingLabel="Evaluating..."
            type="submit"
          />
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={copyDefinition}
            type="button"
          >
            Copy definition
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={copyRequest}
            type="button"
          >
            Copy request
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={resetExample}
            type="button"
          >
            Reset example
          </button>
          {copyStatus && (
            <p className="text-sm font-medium text-emerald-700">
              {copyStatus}
            </p>
          )}
          {error && <ErrorDetails error={error} />}
        </div>
      </form>

      <div className="space-y-6">
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            What You Can Change
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Question IDs, wording, options, and required flags.</li>
            <li>Question weights and scoring rules.</li>
            <li>Profile IDs, score bands, and allocation percentages.</li>
            <li>Informational questions that are validated but not scored.</li>
          </ul>
        </aside>

        <ResultPanel result={result} />
      </div>
    </section>
  );
}
