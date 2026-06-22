import { Section, Text, Link, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

interface CourseExpiringEmailProps {
  customerName: string;
  courseTitle: string;
  daysLeft: number;
  courseUrl: string;
  expiresAt: string;
}

export function CourseExpiringEmail({
  customerName,
  courseTitle,
  daysLeft,
  courseUrl,
  expiresAt,
}: CourseExpiringEmailProps) {
  const urgency =
    daysLeft <= 1 ? "cao" : daysLeft <= 7 ? "trung_binh" : "thap";

  const borderColor =
    urgency === "cao"
      ? "#fecaca"
      : urgency === "trung_binh"
        ? "#fde68a"
        : "#bae6fd";
  const bgColor =
    urgency === "cao"
      ? "#fef2f2"
      : urgency === "trung_binh"
        ? "#fffbeb"
        : "#f0f9ff";
  const textColor =
    urgency === "cao"
      ? "#991b1b"
      : urgency === "trung_binh"
        ? "#92400e"
        : "#075985";

  return (
    <EmailLayout
      preview={`Khóa học "${courseTitle}" sắp hết hạn — còn ${daysLeft} ngày`}
      title="Sắp hết hạn khóa học"
    >
      <Section style={contentSection}>
        <Text style={greeting}>Xin chào {customerName},</Text>

        <Section
          style={{
            ...warningBox,
            backgroundColor: bgColor,
            borderColor,
          }}
        >
          <Text style={{ ...warningTitle, color: textColor }}>
            {daysLeft <= 1
              ? "⚠️ Khóa học sắp hết hạn vào ngày mai!"
              : `⏰ Khóa học sẽ hết hạn sau ${daysLeft} ngày`}
          </Text>
        </Section>

        <Text style={paragraph}>
          Khóa học <strong>{courseTitle}</strong> sẽ hết hạn vào{" "}
          <strong>{expiresAt}</strong>.
        </Text>

        <Text style={paragraph}>
          {daysLeft <= 3
            ? "Hãy hoàn thành khóa học ngay trước khi hết hạn!"
            : "Bạn vẫn còn thời gian để hoàn thành khóa học."}
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

        <Text style={paragraph}>
          Nếu bạn cần gia hạn, vui lòng liên hệ với chúng tôi qua email hoặc số
          điện thoại bên dưới.
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

const warningBox: React.CSSProperties = {
  borderRadius: "8px",
  border: "1px solid",
  padding: "16px",
  textAlign: "center",
  margin: "16px 0",
};

const warningTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
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
