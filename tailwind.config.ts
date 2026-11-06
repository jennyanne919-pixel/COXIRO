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
        // Paleta "Celeste eléctrico" (rediseño). Fuente de verdad de la marca.
        cx: {
          noche: "#07142B", // fondos oscuros, texto de botón sobre celeste
          celeste: "#38C6FF", // color de marca: botones, logo, detalles sobre fondo oscuro
          prof: "#0874BD", // texto de acento y enlaces sobre fondo blanco
          hielo: "#EAF7FF", // secciones claras alternas
          blanco: "#FFFFFF",
          texto: "#0B1220",
          "texto-2": "#5A6478", // texto secundario sobre blanco o hielo
          "texto-osc-2": "#A9B8D0", // texto secundario sobre noche
          borde: "#E3EAF3",
        },
        // Alias heredados de la paleta anterior, apuntando a los valores
        // nuevos por si queda alguna clase suelta. No usar en código nuevo.
        ink: "#07142B",
        paper: "#FFFFFF",
        copper: { DEFAULT: "#0874BD", light: "#38C6FF", dark: "#0874BD" },
        stone: "#5A6478",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        tabIn: {
          "0%": { opacity: "0", transform: "scale(.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        panelIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        float: "float 6s ease-in-out infinite",
        floatSlow: "float 7s ease-in-out -2.5s infinite",
        tabIn: "tabIn .35s cubic-bezier(.2,.7,.2,1) both",
        panelIn: "panelIn 0.22s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
