import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Preview,
} from "@react-email/components";

export default function WaitlistWelcomeEmail({ nombre }: { nombre: string }) {
  return (
    <Html>
      <Head />
      <Preview>Ya estás en la lista de espera de Coxiro</Preview>
      <Body style={{ backgroundColor: "#F7F3EC", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#16181D", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#16181D" }}>
            ¡Ya estás dentro, {nombre}!
          </Heading>
          <Text style={{ fontSize: "15px", color: "#16181D", lineHeight: "1.6" }}>
            Te hemos apuntado a la lista de espera de Coxiro. En cuanto
            abramos, serás de los primeros en enterarte — sin spam, solo
            cuando de verdad haya algo que contarte.
          </Text>
          <Text style={{ fontSize: "13px", color: "#8A8A82", marginTop: "40px" }}>
            ¿Alguna duda? Escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
