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
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            ¡Bienvenido, {nombre}!
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            {esProveedor
              ? "Tu cuenta de profesional en Coxiro ya está lista. Publica tu primer servicio y empieza a cobrar sin complicaciones."
              : "Tu cuenta en Coxiro ya está lista. Desde aquí podrás ver tus compras y acceder a tu contenido."}
          </Text>

          <Section
            style={{
              marginTop: "20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #38C6FF66",
              borderRadius: "8px",
              padding: "14px 16px",
            }}
          >
            <Text style={{ fontSize: "13px", color: "#07142B", lineHeight: "1.5", margin: 0 }}>
              {esProveedor
                ? "📋 Estamos en fase de pruebas internas antes del lanzamiento público. Te avisaremos por email en cuanto Coxiro esté completamente operativo para el público."
                : "📋 Ahora mismo estamos en fase de pruebas internas antes del lanzamiento público — cualquier compra que realices en este momento es parte de esas pruebas. Te avisaremos por email en cuanto el servicio esté completamente operativo."}
            </Text>
          </Section>

          <Section style={{ marginTop: "28px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
              style={{
                backgroundColor: "#38C6FF",
                color: "#07142B",
                padding: "12px 24px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Ir a mi panel
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "40px" }}>
            ¿Alguna duda? Escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
