/**
 * Derive dropdown preset from numeric days string.
 * Returns: "" | "6" | "9" | "12" | "custom"
 */
export function deriveDurationPreset(rawDays: string): string {
  const d = rawDays.trim();
  if (!d) return "";
  const n = Number(d);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n === 180) return "6";
  if (n === 270) return "9";
  if (n === 365) return "12";
  return "custom";
}

/**
 * Convert a preset + custom value into a days number.
 * Returns null if unlimited, or the number of days.
 */
export function durationPresetToDays(
  preset: string,
  customDays: string
): number | null {
  if (preset === "unlimited" || (!preset && !customDays)) return null;
  if (preset === "custom") {
    const n = Number(customDays);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }
  // preset "6" | "9" | "12"
  const map: Record<string, number> = { "6": 180, "9": 270, "12": 365 };
  return map[preset] ?? null;
}
