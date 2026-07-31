import { Html, Head, Body, Container, Text, Hr } from "@react-email/components";

export default function InternalSaleEmail({
  cliente,
  clienteEmail,
  proveedor,
  servicio,
  importe,
  stripePaymentIntentId,
  fecha,
}: {
  cliente: string;
  clienteEmail: string;
  proveedor: string;
  servicio: string;
  importe: string;
  stripePaymentIntentId: string;
  fecha: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "monospace", fontSize: "13px", padding: "20px" }}>
        <Container>
          <Text style={{ fontWeight: 700 }}>Nueva venta en Coxiro</Text>
          <Hr />
          <Text>Cliente: {cliente}</Text>
          <Text>Email del cliente: {clienteEmail}</Text>
          <Text>Proveedor: {proveedor}</Text>
          <Text>Servicio: {servicio}</Text>
          <Text>Importe: {importe}</Text>
          <Text>Fecha: {fecha}</Text>
          <Text>Stripe Payment Intent: {stripePaymentIntentId}</Text>
        </Container>
      </Body>
    </Html>
  );
}
