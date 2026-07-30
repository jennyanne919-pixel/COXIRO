import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr,
  Preview,
} from "@react-email/components";

export default function PurchaseConfirmationEmail({
  nombreCliente,
  servicio,
  proveedor,
  importe,
  invoiceUrl,
}: {
  nombreCliente: string;
  servicio: string;
  proveedor: string;
  importe: string;
  invoiceUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu pago se ha completado correctamente</Preview>
      <Body style={{ backgroundColor: "#F7F3EC", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#16181D", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#16181D" }}>
            Gracias por tu compra, {nombreCliente}
          </Heading>
          <Text style={{ fontSize: "15px", color: "#16181D", lineHeight: "1.6" }}>
            Tu pago se ha completado correctamente.
          </Text>

          <Section style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Servicio</Text>
            <Text style={{ fontSize: "16px", color: "#16181D", marginTop: "2px", fontWeight: 600 }}>{servicio}</Text>
            <Hr style={{ borderColor: "#8A8A8230", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Profesional</Text>
            <Text style={{ fontSize: "15px", color: "#16181D", marginTop: "2px" }}>{proveedor}</Text>
            <Hr style={{ borderColor: "#8A8A8230", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Importe</Text>
            <Text style={{ fontSize: "18px", color: "#16181D", marginTop: "2px", fontWeight: 700 }}>{importe}</Text>
          </Section>

          <Section style={{ marginTop: "24px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
              style={{
                backgroundColor: "#E2703A",
                color: "#F7F3EC",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                marginRight: "10px",
              }}
            >
              Ver mis compras
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", marginTop: "16px" }}>
            <a href={invoiceUrl} style={{ color: "#E2703A" }}>
              Descargar factura
            </a>
          </Text>

          <Text style={{ fontSize: "13px", color: "#8A8A82", marginTop: "32px" }}>
            ¿Alguna duda? Escríbenos a info.coxiro@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
