import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Preview,
} from "@react-email/components";

export default function RecoverPasswordEmail({ enlace }: { enlace: string }) {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña de Coxiro</Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            Crea tu contraseña nueva
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Hemos recibido una petición para cambiar la contraseña de tu
            cuenta de Coxiro. Pulsa el botón para elegir una nueva. El
            enlace funciona una sola vez y caduca en unas horas.
          </Text>
          <Section style={{ marginTop: "28px" }}>
            <Button
              href={enlace}
              style={{
                backgroundColor: "#38C6FF",
                color: "#07142B",
                padding: "12px 24px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Cambiar mi contraseña
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "40px" }}>
            Si no has sido tú, ignora este correo: tu contraseña actual sigue funcionando. Si tienes dudas, escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
