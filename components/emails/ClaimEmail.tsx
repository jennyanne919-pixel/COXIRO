import { Html, Head, Body, Container, Heading, Text, Section, Hr, Preview } from "@react-email/components";

// Correo de reclamaciones: sirve para el justificante que recibe el cliente y
// para el aviso interno de Coxiro (cambian el título, la intro y las filas).
export default function ClaimEmail({
  titulo,
  intro,
  referencia,
  filas,
  pie,
}: {
  titulo: string;
  intro: string;
  referencia: string;
  filas: { label: string; value: string }[];
  pie?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`${titulo} · ${referencia}`}</Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "520px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>coxiro</Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>{titulo}</Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>{intro}</Text>
          <Section style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", marginTop: "16px" }}>
            <Text style={{ fontSize: "13px", color: "#5A6478", margin: 0 }}>Referencia</Text>
            <Text style={{ fontSize: "18px", color: "#07142B", marginTop: "2px", fontWeight: 700 }}>{referencia}</Text>
            {filas.map((f) => (
              <div key={f.label}>
                <Hr style={{ borderColor: "#5A647830", margin: "12px 0" }} />
                <Text style={{ fontSize: "13px", color: "#5A6478", margin: 0 }}>{f.label}</Text>
                <Text style={{ fontSize: "14px", color: "#07142B", marginTop: "2px", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                  {f.value || "—"}
                </Text>
              </div>
            ))}
          </Section>
          {pie && <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "24px", lineHeight: "1.5" }}>{pie}</Text>}
        </Container>
      </Body>
    </Html>
  );
}
