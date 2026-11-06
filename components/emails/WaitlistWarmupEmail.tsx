import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Preview,
} from "@react-email/components";

// PLANTILLA BASE -- pendiente de contenido y de decidir la secuencia
// (cuántos emails, cada cuánto). No está conectada a ningún envío
// automático todavía -- ver lib/email/send.ts, sendWaitlistWarmup()
// no se llama desde ningún sitio por ahora.
export default function WaitlistWarmupEmail({
  nombre,
  numeroEnSecuencia,
}: {
  nombre: string;
  numeroEnSecuencia: number;
}) {
  return (
    <Html>
      <Head />
      <Preview>[Pendiente de redactar]</Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            Hola {nombre},
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            [Contenido pendiente — email {numeroEnSecuencia} de la secuencia
            de calentamiento]
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
