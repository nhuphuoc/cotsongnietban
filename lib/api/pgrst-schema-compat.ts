/**
 * PostgREST returns PGRST204 when a column is missing from the schema cache.
 * Strip reported columns from the payload and retry until success or a non-recoverable error.
 */
export function pgrst204MissingColumnName(error: unknown): string | null {
  const e = error as { code?: string; message?: string };
  if (e?.code !== "PGRST204") return null;
  const m = String(e.message ?? "").match(/Could not find the '([^']+)' column/i);
  return m?.[1] ?? null;
}

export async function omitMissingColumnsUntilSuccess<T>(
  initialPayload: Record<string, unknown>,
  run: (payload: Record<string, unknown>) => Promise<{ data: T | null; error: unknown }>,
  opts?: { maxOmissions?: number }
): Promise<{ data: T | null; error: unknown }> {
  const maxOmissions = opts?.maxOmissions ?? 40;
  let payload: Record<string, unknown> = { ...initialPayload };

  for (let i = 0; i < maxOmissions; i++) {
    const result = await run(payload);
    if (!result.error) return result;

    const col = pgrst204MissingColumnName(result.error);
    if (!col || !(col in payload)) return result;

    const next = { ...payload };
    delete next[col];
    payload = next;
  }

  return run(payload);
}
