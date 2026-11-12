import { Html, Head, Body, Container, Heading, Text, Preview, Button } from "@react-email/components";

export default function LessonCommentEmail({
  destinatario,
  autor,
  leccion,
  servicio,
  texto,
  enlace,
  esRespuesta,
}: {
  destinatario: string;
  autor: string;
  leccion: string;
  servicio: string;
  texto: string;
  enlace: string;
  esRespuesta: boolean;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        {esRespuesta ? "Te han respondido en" : "Nueva duda en"} «{leccion}»
      </Preview>
      <Body style={{ backgroundColor: "#EAF7FF", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "20px", fontWeight: 700, color: "#07142B", marginBottom: "24px" }}>
            coxiro
          </Text>
          <Heading style={{ fontSize: "22px", color: "#07142B" }}>
            {esRespuesta ? "Tienes una respuesta" : "Tienes una duda nueva"}
          </Heading>
          <Text style={{ fontSize: "15px", color: "#07142B", lineHeight: "1.6" }}>
            Hola {destinatario}, {autor} {esRespuesta ? "ha respondido" : "ha escrito"} en la lección
            «{leccion}» de «{servicio}»:
          </Text>
          <Text
            style={{
              fontSize: "15px",
              color: "#07142B",
              lineHeight: "1.6",
              backgroundColor: "#ffffff",
              borderLeft: "3px solid #38C6FF",
              padding: "12px 16px",
              whiteSpace: "pre-wrap",
            }}
          >
            {texto}
          </Text>
          <Button
            href={enlace}
            style={{
              backgroundColor: "#38C6FF",
              color: "#07142B",
              fontWeight: 600,
              fontSize: "15px",
              padding: "12px 24px",
              borderRadius: "999px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "8px",
            }}
          >
            {esRespuesta ? "Ver la respuesta" : "Responder"}
          </Button>
          <Text style={{ fontSize: "13px", color: "#5A6478", marginTop: "40px" }}>
            Este aviso se envía cada vez que hay actividad en tus conversaciones de Coxiro.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
