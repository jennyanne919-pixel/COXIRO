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
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            Gracias por tu compra, {nombreCliente}
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Tu pago se ha completado correctamente.
          </Text>

          <Section style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Servicio</Text>
            <Text style={{ fontSize: "16px", color: "#07142B", marginTop: "2px", fontWeight: 600 }}>{servicio}</Text>
            <Hr style={{ borderColor: "#5A647830", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Profesional</Text>
            <Text style={{ fontSize: "15px", color: "#07142B", marginTop: "2px" }}>{proveedor}</Text>
            <Hr style={{ borderColor: "#5A647830", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Importe</Text>
            <Text style={{ fontSize: "18px", color: "#07142B", marginTop: "2px", fontWeight: 700 }}>{importe}</Text>
          </Section>

          <Section style={{ marginTop: "24px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
              style={{
                backgroundColor: "#38C6FF",
                color: "#07142B",
                padding: "12px 24px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "14px",
                marginRight: "10px",
              }}
            >
              Ver mis compras
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", marginTop: "16px" }}>
            <a href={invoiceUrl} style={{ color: "#0874BD" }}>
              Descargar factura
            </a>
          </Text>

          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "32px" }}>
            ¿Alguna duda? Escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
