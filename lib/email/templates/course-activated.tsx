import { Section, Text, Link, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

interface CourseActivatedEmailProps {
  customerName: string;
  courseTitle: string;
  courseUrl: string;
  expiresAt?: string | null; // ISO date string, null = vĩnh viễn
}

export function CourseActivatedEmail({
  customerName,
  courseTitle,
  courseUrl,
  expiresAt,
}: CourseActivatedEmailProps) {
  const expiryText = expiresAt
    ? `Khóa học có hiệu lực đến ${new Date(expiresAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`
    : "Khóa học không giới hạn thời gian truy cập.";

  return (
    <EmailLayout
      preview={`Khóa học "${courseTitle}" đã sẵn sàng`}
      title="Khóa học đã sẵn sàng"
    >
      <Section style={contentSection}>
        <Text style={greeting}>Xin chào {customerName},</Text>
        <Text style={paragraph}>
          Khóa học <strong>{courseTitle}</strong> đã được kích hoạt và sẵn sàng
          cho bạn.
        </Text>

        <Section style={infoBox}>
          <Text style={infoLabel}>Khóa học</Text>
          <Text style={infoValue}>{courseTitle}</Text>

          <Text style={{ ...infoLabel, marginTop: "12px" }}>Thời hạn</Text>
          <Text style={infoValue}>{expiryText}</Text>
        </Section>

        <Text style={paragraph}>
          Nhấn nút bên dưới để bắt đầu học:
        </Text>

        <Button href={courseUrl} style={ctaButton}>
          Vào học ngay
        </Button>

        <Text style={hint}>
          Hoặc truy cập:{" "}
          <Link href={courseUrl} style={link}>
            {courseUrl}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}

// ─── Styles ───

const contentSection: React.CSSProperties = {
  padding: "8px 32px 24px",
};

const greeting: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  color: "#555555",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "16px 0",
};

const infoLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: "0 0 2px",
};

const infoValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  fontWeight: "600",
  margin: 0,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#c0392b",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "8px",
};

const hint: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  margin: "16px 0 0",
};

const link: React.CSSProperties = {
  color: "#c0392b",
  wordBreak: "break-all",
};
