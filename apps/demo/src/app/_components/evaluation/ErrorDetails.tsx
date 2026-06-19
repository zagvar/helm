type ApiError = {
  readonly message: string;
  readonly details?: unknown;
};

type FlattenedValidationDetails = {
  readonly formErrors?: readonly string[];
  readonly fieldErrors?: Record<string, readonly string[] | undefined>;
};

export function ErrorDetails({ error }: { readonly error: ApiError }) {
  const flattened = parseFlattenedValidationDetails(error.details);
  const hasFlattenedDetails =
    flattened.formErrors.length > 0 || flattened.fieldErrors.length > 0;

  return (
    <div className="space-y-3 text-sm text-red-700" role="alert">
      <p className="font-medium">{error.message}</p>
      {hasFlattenedDetails ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          {flattened.formErrors.length > 0 && (
            <ul className="list-disc space-y-1 pl-5">
              {flattened.formErrors.map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          )}
          {flattened.fieldErrors.length > 0 && (
            <dl className="space-y-2">
              {flattened.fieldErrors.map(([field, messages]) => (
                <div key={field}>
                  <dt className="font-semibold">{field}</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-5">
                      {messages.map((message, index) => (
                        <li key={`${field}-${message}-${index}`}>
                          {message}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ) : null}
      {!hasFlattenedDetails && error.details !== undefined ? (
        <pre className="max-h-56 overflow-auto rounded-md border border-red-200 bg-red-50 p-3 font-mono text-xs leading-5 text-red-950">
          {JSON.stringify(error.details, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

function parseFlattenedValidationDetails(details: unknown): {
  readonly formErrors: readonly string[];
  readonly fieldErrors: readonly [string, readonly string[]][];
} {
  if (!isRecord(details)) {
    return { formErrors: [], fieldErrors: [] };
  }

  const candidate = details as FlattenedValidationDetails;
  return {
    formErrors: Array.isArray(candidate.formErrors)
      ? candidate.formErrors.filter(isString)
      : [],
    fieldErrors: isRecord(candidate.fieldErrors)
      ? Object.entries(candidate.fieldErrors)
          .map(([field, messages]) => [
            field,
            Array.isArray(messages) ? messages.filter(isString) : [],
          ] as const)
          .filter(([, messages]) => messages.length > 0)
      : [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
