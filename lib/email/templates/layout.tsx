import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
  title: string;
}

export function EmailLayout({ children, preview, title }: EmailLayoutProps) {
  return (
    <Html lang="vi">
      <Head />
      {preview ? <Text style={{ display: "none" }}>{preview}</Text> : null}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href="https://cotsongnietban.vn" style={logoLink}>
              <Text style={brandName}>Cột Sống Niết Bàn</Text>
            </Link>
          </Section>

          {/* Title */}
          <Section style={titleSection}>
            <Text style={titleText}>{title}</Text>
          </Section>

          {/* Content */}
          {children}

          {/* Divider */}
          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Cột Sống Niết Bàn
            </Text>
            <Text style={footerSubText}>
              Phục hồi chức năng · Lấy cột sống làm trọng tâm
            </Text>
            <Text style={footerContact}>
              📞 090 298 68 55 · ✉️ nirvanaspine@gmail.com
            </Text>
            <Text style={footerContact}>
              🌐{" "}
              <Link href="https://cotsongnietban.vn" style={footerLink}>
                cotsongnietban.vn
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───

const body: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: 0,
  padding: "20px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: "600px",
  margin: "0 auto",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const header: React.CSSProperties = {
  backgroundColor: "#c0392b",
  padding: "24px 32px",
  textAlign: "center",
};

const logoLink: React.CSSProperties = {
  textDecoration: "none",
};

const brandName: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "2px",
  margin: 0,
};

const titleSection: React.CSSProperties = {
  padding: "24px 32px 8px",
};

const titleText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "24px 32px",
};

const footer: React.CSSProperties = {
  padding: "0 32px 24px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  margin: "0 0 4px",
};

const footerSubText: React.CSSProperties = {
  fontSize: "11px",
  color: "#bbbbbb",
  margin: "0 0 8px",
  fontStyle: "italic",
};

const footerContact: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  margin: "2px 0",
};

const footerLink: React.CSSProperties = {
  color: "#c0392b",
  textDecoration: "none",
};
