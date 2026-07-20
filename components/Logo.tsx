type LogoProps = {
  variant?: "dark" | "light";
  size?: number;
  showWordmark?: boolean;
};

// Único lugar donde vive el símbolo de Coxiro. Cambia aquí y se
// actualiza en toda la app: nav, dashboard, footer, favicon base.
export default function Logo({
  variant = "dark",
  size = 24,
  showWordmark = true,
}: LogoProps) {
  const ring = variant === "dark" ? "#F7F3EC" : "#16181D";
  const wordColor = variant === "dark" ? "text-paper" : "text-ink";

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="18" fill="none" stroke="#E2703A" strokeWidth="4" />
        <path
          d="M24 6 A18 18 0 0 0 24 42"
          fill="none"
          stroke={ring}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="24" cy="6" r="4" fill={ring} />
      </svg>
      {showWordmark && (
        <span className={`font-display font-medium text-lg ${wordColor}`}>
          coxiro
        </span>
      )}
    </div>
  );
}
