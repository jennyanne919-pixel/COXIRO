import Image from "next/image";

type LogoProps = {
  variant?: "dark" | "light";
  size?: number;
  showWordmark?: boolean;
};

// Único lugar donde vive el logo de Coxiro. Cambia aquí y se
// actualiza en toda la app: nav, dashboard, footer, login...
//
// variant="light" -> para fondos CLAROS (texto negro).
// variant="dark"  -> para fondos OSCUROS (texto claro).
// "size" mantiene el significado de siempre (24 = tamaño normal de
// cabecera, 20 = tamaño pequeño); el logo completo (arco + nombre)
// se escala a partir de él. "showWordmark" ya no se usa: el nombre
// forma parte de la imagen.
const RATIO = 828 / 416; // ancho / alto de la imagen
const ESCALA = 1.8;

export default function Logo({ variant = "dark", size = 24 }: LogoProps) {
  const src =
    variant === "dark"
      ? "/logo/coxiro-logo-para-fondo-oscuro.png"
      : "/logo/coxiro-logo-para-fondo-claro.png";
  const height = Math.round(size * ESCALA);
  const width = Math.round(height * RATIO);

  return (
    <Image
      src={src}
      alt="Coxiro"
      width={width}
      height={height}
      style={{ width, height }}
    />
  );
}
