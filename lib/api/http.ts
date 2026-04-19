import { NextResponse } from "next/server";

function normalizeDetails(details: unknown) {
  if (details == null) return null;
  if (process.env.NODE_ENV === "production") return null;

  if (details instanceof Error) {
    return {
      name: details.name,
      message: details.message,
    };
  }

  return details;
}

export function ok<T>(data: T, init?: number | ResponseInit) {
  if (typeof init === "number") {
    return NextResponse.json({ data }, { status: init });
  }
  return NextResponse.json({ data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        message,
        details: normalizeDetails(details),
      },
    },
    { status }
  );
}
