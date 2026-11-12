const TZ = "Europe/Madrid";

// Diferencia (en minutos) entre la hora de Madrid y UTC en un instante dado.
function offsetMadrid(ms: number): number {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(ms));
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value);
  const comoUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return Math.round((comoUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

// "2026-11-20T18:30" (hora de Madrid, como lo da <input type="datetime-local">) -> ISO en UTC.
export function madridAIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const base = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let ms = base - offsetMadrid(base) * 60000;
  ms = base - offsetMadrid(ms) * 60000;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function fechaMadrid(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
