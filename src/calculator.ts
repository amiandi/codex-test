export type GasInput = { capacity: number; tare: number; total: number };
export type GasResult =
  | { ok: true; remaining: number; percentage: number }
  | { ok: false; message: string };

/** Calculate from unrounded weights; do not conceal invalid weights by clamping. */
export function calculateGas({ capacity, tare, total }: GasInput): GasResult {
  if (![capacity, tare, total].every(Number.isFinite))
    return {
      ok: false,
      message: "Bitte fülle alle Gewichtsangaben mit gültigen Zahlen aus.",
    };
  if (capacity <= 0)
    return {
      ok: false,
      message: "Die Flaschengröße muss größer als 0 kg sein.",
    };
  if (tare < 0 || total < 0)
    return { ok: false, message: "Gewichte dürfen nicht negativ sein." };
  if (total < tare)
    return {
      ok: false,
      message: "Das Gesamtgewicht darf nicht unter dem Tara-Gewicht liegen.",
    };
  const remaining = total - tare;
  if (remaining - capacity > 1e-9)
    return {
      ok: false,
      message:
        "Das Gasgewicht übersteigt die Flaschengröße. Bitte prüfe deine Angaben auf eine mögliche Überfüllung.",
    };
  return {
    ok: true,
    remaining: Math.min(remaining, capacity),
    percentage: Math.min(100, (remaining / capacity) * 100),
  };
}

export function parseWeight(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return /^-?\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}
