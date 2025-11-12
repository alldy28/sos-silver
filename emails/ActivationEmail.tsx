import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
} from "@react-email/components";

interface ActivationEmailProps {
  userEmail: string;
  confirmationLink: string;
}

export const ActivationEmail = ({
  userEmail,
  confirmationLink,
}: ActivationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Aktivasi Akun Sossilver</Heading>
          <Text style={text}>Halo,</Text>
          <Text style={text}>
            Terima kasih telah mendaftar di Sossilver! Untuk mengaktifkan akun
            Anda ({userEmail}), silakan klik tombol di bawah ini:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationLink}>
              Aktivasi Akun
            </Button>
          </Section>
          <Text style={text}>
            Atau copy paste link berikut ke browser Anda:
          </Text>
          <Text style={link}>{confirmationLink}</Text>
          <Text style={footer}>
            Jika Anda tidak mendaftar, abaikan email ini.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Default export untuk Resend
export default ActivationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const link = {
  color: "#5469d4",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "32px",
};
