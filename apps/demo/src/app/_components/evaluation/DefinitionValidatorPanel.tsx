import { useState } from "react";
import type { RiskProfileDefinition } from "@vibedcoder/invespro-types";
import { ErrorDetails } from "./ErrorDetails";
import { Button } from "./fields";

type ApiError = {
  readonly message: string;
  readonly details?: unknown;
};

type ValidationState =
  | { readonly status: "idle" }
  | { readonly status: "valid"; readonly message: string }
  | { readonly status: "invalid"; readonly error: ApiError };

export function DefinitionValidatorPanel({
  initialDefinition,
}: {
  readonly initialDefinition: RiskProfileDefinition;
}) {
  const [definitionJson, setDefinitionJson] = useState(() =>
    JSON.stringify(initialDefinition, null, 2),
  );
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setValidation({ status: "idle" });

    try {
      const input = JSON.parse(definitionJson) as unknown;
      const response = await fetch("/api/definitions/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = await response.json();

      if (!response.ok || data.valid !== true) {
        setValidation({
          status: "invalid",
          error: {
            message:
              data?.error?.message ?? "Definition validation failed.",
            details: data?.error?.details,
          },
        });
        return;
      }

      setValidation({
        status: "valid",
        message: "Definition is valid.",
      });
    } catch (err) {
      setValidation({
        status: "invalid",
        error: {
          message:
          err instanceof Error ? err.message : "Definition validation failed.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Definition Validator
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Paste a custom definition to validate it against the public Invespro
            definition contract.
          </p>
        </div>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Definition JSON
          <textarea
            className="mt-2 min-h-96 w-full rounded-md border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            value={definitionJson}
            onChange={(event) => setDefinitionJson(event.target.value)}
            spellCheck={false}
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <Button
            disabled={isSubmitting}
            label="Validate definition"
            loadingLabel="Validating..."
            type="submit"
          />
          {validation.status === "valid" && (
            <p
              className="text-sm font-medium text-emerald-700"
              role="status"
            >
              {validation.message}
            </p>
          )}
          {validation.status === "invalid" && (
            <ErrorDetails error={validation.error} />
          )}
        </div>
      </form>

      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          What Is Checked
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>Question IDs, types, options, and required flags.</li>
          <li>Scoring rules, weights, and range coverage.</li>
          <li>Profiles, score bands, and allocation totals.</li>
          <li>Override references and profile IDs.</li>
        </ul>
      </aside>
    </section>
  );
}
