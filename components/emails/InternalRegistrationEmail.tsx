import { Html, Head, Body, Container, Text, Hr } from "@react-email/components";

export default function InternalRegistrationEmail({
  nombre,
  email,
  rol,
  fecha,
}: {
  nombre: string;
  email: string;
  rol: string;
  fecha: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "monospace", fontSize: "13px", padding: "20px" }}>
        <Container>
          <Text style={{ fontWeight: 700 }}>Nuevo registro en Coxiro</Text>
          <Hr />
          <Text>Nombre: {nombre}</Text>
          <Text>Email: {email}</Text>
          <Text>Rol: {rol}</Text>
          <Text>Fecha: {fecha}</Text>
        </Container>
      </Body>
    </Html>
  );
}
