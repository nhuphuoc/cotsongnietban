import { Section, Text, Link, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

interface WelcomeEmailProps {
  customerName: string;
  coursesUrl: string;
}

export function WelcomeEmail({
  customerName,
  coursesUrl,
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="Chào mừng đến với Cột Sống Niết Bàn"
      title="Chào mừng bạn!"
    >
      <Section style={contentSection}>
        <Text style={greeting}>Xin chào {customerName},</Text>
        <Text style={paragraph}>
          Chào mừng bạn đến với <strong>Cột Sống Niết Bàn</strong> — nền tảng
          phục hồi chức năng cột sống trực tuyến.
        </Text>

        <Text style={paragraph}>
          Tại đây bạn có thể:
        </Text>

        <Section style={featureList}>
          <Text style={featureItem}>📚 Khám phá các khóa học phục hồi chuyên sâu</Text>
          <Text style={featureItem}>🎥 Học qua video hướng dẫn chi tiết</Text>
          <Text style={featureItem}>📊 Theo dõi tiến độ học tập</Text>
          <Text style={featureItem}>💬 Nhận tư vấn từ chuyên gia</Text>
        </Section>

        <Text style={paragraph}>
          Bắt đầu bằng cách khám phá các khóa học của chúng tôi:
        </Text>

        <Button href={coursesUrl} style={ctaButton}>
          Xem khóa học
        </Button>

        <Text style={hint}>
          Hoặc truy cập:{" "}
          <Link href={coursesUrl} style={link}>
            {coursesUrl}
          </Link>
        </Text>

        <Text style={paragraph}>
          Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ qua email hoặc số điện thoại
          bên dưới.
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

const featureList: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "16px 0",
};

const featureItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#333333",
  lineHeight: "2",
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
