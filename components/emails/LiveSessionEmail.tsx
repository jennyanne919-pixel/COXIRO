import { Html, Head, Body, Container, Heading, Text, Preview, Button } from "@react-email/components";

export default function LiveSessionEmail({
  nombre,
  servicio,
  proveedor,
  titulo,
  cuando,
  notas,
  enlace,
}: {
  nombre: string;
  servicio: string;
  proveedor: string;
  titulo: string;
  cuando: string;
  notas?: string;
  enlace: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        Sesión en directo: {titulo} — {cuando}
      </Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>Sesión en directo</Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Hola {nombre}, {proveedor} ha programado una sesión en directo de «{servicio}»:
          </Text>
          <Text style={{ fontSize: "17px", fontWeight: 700, color: "#07142B", margin: "0 0 4px" }}>{titulo}</Text>
          <Text style={{ fontSize: "15px", color: "#07142B", margin: "0 0 12px" }}>{cuando} (hora de Madrid)</Text>
          {notas ? (
            <Text style={{ fontSize: "14px", color: "#07142B", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{notas}</Text>
          ) : null}
          <Button
            href={enlace}
            style={{
              backgroundColor: "#38C6FF",
              color: "#07142B",
              fontWeight: 600,
              fontSize: "15px",
              padding: "12px 24px",
              borderRadius: "999px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "8px",
            }}
          >
            Ver en mi curso
          </Button>
          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "40px" }}>
            El enlace para unirte aparece en tu curso en Coxiro, solo para quienes han contratado el servicio.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
