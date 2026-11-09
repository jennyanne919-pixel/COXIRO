import type { ReactNode } from "react";

// Iconos de trazo (24x24). Un solo sitio para todo el panel.
const PATHS: Record<string, string> = {
  cobros: "M3 7a2 2 0 0 1 2-2h13v4 M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2z M16 14h2",
  servicios: "M16.5 9.4 7.55 4.24 M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.3 7 12 12l8.7-5 M12 22V12",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  partners: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  doc: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  pencil: "M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  folder: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z",
  external: "M15 3h6v6 M10 14 21 3 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  plus: "M5 12h14 M12 5v14",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  play: "M6 3l14 9-14 9z",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  check: "M20 6 9 17l-5-5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  trend: "M22 7 13.5 15.5 8.5 10.5 2 17 M16 7h6v6",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "w-4 h-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name].split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
}

export const fmtEur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" }).format(n);

export const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-display font-bold text-2xl text-cx-noche">{title}</h1>
        {subtitle && <p className="text-sm text-cx-texto-2 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white border border-cx-borde ${className}`}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  dark = false,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  icon: IconName;
  dark?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 ${className} ${
        dark ? "bg-cx-noche text-white" : "bg-white border border-cx-borde text-cx-noche"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${dark ? "text-cx-texto-osc-2" : "text-cx-texto-2"}`}>
          {label}
        </span>
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            dark ? "bg-white/10 text-cx-celeste" : "bg-cx-hielo text-cx-prof"
          }`}
        >
          <Icon name={icon} />
        </span>
      </div>
      <div className={`font-display font-bold text-3xl mt-3 ${dark ? "text-cx-celeste" : ""}`}>
        {value}
      </div>
      {hint && (
        <div className={`text-xs mt-1 ${dark ? "text-cx-texto-osc-2" : "text-cx-texto-2"}`}>{hint}</div>
      )}
    </div>
  );
}

const TONOS = {
  verde: "bg-emerald-50 text-emerald-700",
  ambar: "bg-amber-50 text-amber-700",
  celeste: "bg-cx-celeste/15 text-cx-prof",
  gris: "bg-cx-hielo text-cx-texto-2",
};

export function Badge({
  tone = "gris",
  children,
  dot = false,
}: {
  tone?: keyof typeof TONOS;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 whitespace-nowrap ${TONOS[tone]}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// Clases de botón reutilizables.
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-2 hover:brightness-105 transition whitespace-nowrap";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-cx-borde bg-white text-cx-noche text-xs font-medium px-3 py-1.5 hover:border-cx-celeste hover:text-cx-prof transition whitespace-nowrap";
export const BTN_ICON =
  "inline-flex items-center justify-center w-8 h-8 rounded-full border border-cx-borde bg-white text-cx-texto-2 hover:border-cx-celeste hover:text-cx-prof transition";

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10">
      <span className="w-12 h-12 rounded-2xl bg-cx-hielo text-cx-prof flex items-center justify-center">
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <p className="font-medium text-cx-noche mt-4">{title}</p>
      {text && <p className="text-sm text-cx-texto-2 mt-1 max-w-sm">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const ini = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      className="w-10 h-10 rounded-full bg-cx-hielo text-cx-prof font-display font-bold flex items-center justify-center text-sm shrink-0"
      aria-hidden="true"
    >
      {ini || "·"}
    </span>
  );
}
