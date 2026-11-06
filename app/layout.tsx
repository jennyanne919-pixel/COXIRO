import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Coxiro — Vende tus servicios online y gana hasta un 10% más",
  description:
    "Vende tus servicios online en España a clientes particulares y gana hasta un 10% más desde tu primera venta: pasarela de pago, facturación automática y alojamiento de tu contenido, todo en un mismo sitio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
