import type { Config } from "tailwindcss";

// Tokens de marca de Coxiro. Cambia solo aquí para actualizar
// toda la app: colores, tipografía, radios.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16181D",
        paper: "#F7F3EC",
        copper: {
          DEFAULT: "#E2703A",
          light: "#F3A87D",
          dark: "#C95F2C",
        },
        stone: "#8A8A82",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
