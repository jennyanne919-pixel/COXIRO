import { Html, Head, Body, Container, Heading, Text, Preview } from "@react-email/components";

export default function SubscriptionCancelledEmail({
  nombreCliente,
  servicio,
  proveedor,
  fechaFin,
}: {
  nombreCliente: string;
  servicio: string;
  proveedor: string;
  fechaFin: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu suscripción en Coxiro se ha dado de baja</Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            Tu suscripción se ha dado de baja
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Hola {nombreCliente}, {proveedor} ha dado de baja tu suscripción a «{servicio}».
            No se te cobrarán más cuotas.
          </Text>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Conservas el acceso hasta el {fechaFin}, el final del periodo que ya tienes
            pagado.
          </Text>
          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "40px" }}>
            Si no esperabas este correo o tienes dudas, escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
