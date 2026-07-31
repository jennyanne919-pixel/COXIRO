import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
<<<<<<< HEAD
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
=======
  Preview,
} from "@react-email/components";

export default function CreatePasswordEmail({
  nombre,
  enlace,
}: {
  nombre: string;
  enlace: string;
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
}) {
  return (
    <Html>
      <Head />
<<<<<<< HEAD
      <Preview>Tienes una venta nueva</Preview>
=======
      <Preview>Hemos creado tu cuenta en Coxiro</Preview>
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
      <Body style={{ backgroundColor: "#F7F3EC", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#16181D", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#16181D" }}>
<<<<<<< HEAD
            ¡Nueva venta, {nombreProveedor}!
          </Heading>
          <Text style={{ fontSize: "15px", color: "#16181D", lineHeight: "1.6" }}>
            Acabas de recibir un pago en Coxiro.
          </Text>

          <Section style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Cliente</Text>
            <Text style={{ fontSize: "15px", color: "#16181D", marginTop: "2px" }}>{cliente}</Text>
            <Hr style={{ borderColor: "#8A8A8230", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Servicio</Text>
            <Text style={{ fontSize: "15px", color: "#16181D", marginTop: "2px" }}>{servicio}</Text>
            <Hr style={{ borderColor: "#8A8A8230", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Total pagado por el cliente</Text>
            <Text style={{ fontSize: "15px", color: "#16181D", marginTop: "2px" }}>{importeTotal}</Text>
            <Hr style={{ borderColor: "#8A8A8230", margin: "12px 0" }} />
            <Text style={{ fontSize: "14px", color: "#8A8A82", margin: 0 }}>Tú recibes</Text>
            <Text style={{ fontSize: "18px", color: "#16181D", marginTop: "2px", fontWeight: 700 }}>{neto}</Text>
          </Section>

          <Section style={{ marginTop: "24px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
=======
            Hola {nombre}, hemos creado tu cuenta
          </Heading>
          <Text style={{ fontSize: "15px", color: "#16181D", lineHeight: "1.6" }}>
            Acabas de completar una compra en Coxiro. Para poder acceder a
            tu contenido y tus compras cuando quieras, crea tu contraseña
            aquí abajo.
          </Text>
          <Section style={{ marginTop: "28px" }}>
            <Button
              href={enlace}
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
              style={{
                backgroundColor: "#E2703A",
                color: "#F7F3EC",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
<<<<<<< HEAD
              Ver cobros y facturas
            </Button>
          </Section>

          <Text style={{ fontSize: "13px", color: "#8A8A82", marginTop: "32px" }}>
            ¿Alguna duda? Escríbenos a info.coxiro@gmail.com
=======
              Crear mi contraseña
            </Button>
          </Section>
          <Text style={{ fontSize: "13px", color: "#8A8A82", marginTop: "40px" }}>
            Si no reconoces esta compra, escríbenos a coxiro.info@gmail.com
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
