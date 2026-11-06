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

export default function CreatePasswordEmail({
  nombre,
  enlace,
}: {
  nombre: string;
  enlace: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Hemos creado tu cuenta en Coxiro</Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            Hola {nombre}, hemos creado tu cuenta
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Acabas de completar una compra en Coxiro. Para poder acceder a
            tu contenido y tus compras cuando quieras, crea tu contraseña
            aquí abajo.
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
              Crear mi contraseña
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "40px" }}>
            Si no reconoces esta compra, escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
