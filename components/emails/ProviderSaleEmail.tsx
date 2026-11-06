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

export default function ProviderSaleEmail({
  nombreProveedor,
  cliente,
  servicio,
  importeTotal,
  neto,
}: {
  nombreProveedor: string;
  cliente: string;
  servicio: string;
  importeTotal: string;
  neto: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tienes una venta nueva</Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            ¡Nueva venta, {nombreProveedor}!
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Acabas de recibir un pago en Coxiro.
          </Text>

          <Section style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Cliente</Text>
            <Text style={{ fontSize: "15px", color: "#07142B", marginTop: "2px" }}>{cliente}</Text>
            <Hr style={{ borderColor: "#5A647830", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Servicio</Text>
            <Text style={{ fontSize: "15px", color: "#07142B", marginTop: "2px" }}>{servicio}</Text>
            <Hr style={{ borderColor: "#5A647830", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Total pagado por el cliente</Text>
            <Text style={{ fontSize: "15px", color: "#07142B", marginTop: "2px" }}>{importeTotal}</Text>
            <Hr style={{ borderColor: "#5A647830", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#5A6478", margin: 0 }}>Tú recibes</Text>
            <Text style={{ fontSize: "18px", color: "#07142B", marginTop: "2px", fontWeight: 700 }}>{neto}</Text>
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
              }}
            >
              Ver cobros y facturas
            </Button>
          </Section>

          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "32px" }}>
            ¿Alguna duda? Escríbenos a coxiro.info@gmail.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
