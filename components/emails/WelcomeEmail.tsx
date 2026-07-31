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

export default function WelcomeEmail({
  nombre,
  esProveedor,
}: {
  nombre: string;
  esProveedor: boolean;
}) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Coxiro</Preview>
      <Body style={{ backgroundColor: "#F7F3EC", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#16181D", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#16181D" }}>
            ¡Bienvenido, {nombre}!
          </Heading>
          <Text style={{ fontSize: "15px", color: "#16181D", lineHeight: "1.6" }}>
            {esProveedor
              ? "Tu cuenta de profesional en Coxiro ya está lista. Publica tu primer servicio y empieza a cobrar sin complicaciones."
              : "Tu cuenta en Coxiro ya está lista. Desde aquí podrás ver tus compras y acceder a tu contenido."}
          </Text>
          <Section style={{ marginTop: "28px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
              style={{
                backgroundColor: "#E2703A",
                color: "#F7F3EC",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Ir a mi panel
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", color: "#8A8A82", marginTop: "40px" }}>
            ¿Alguna duda? Escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
