import { Section, Text, Link, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

interface PaymentSuccessEmailProps {
  customerName: string;
  courseTitle: string;
  amountVnd: number;
  courseUrl: string;
  orderCode: string;
}

export function PaymentSuccessEmail({
  customerName,
  courseTitle,
  amountVnd,
  courseUrl,
  orderCode,
}: PaymentSuccessEmailProps) {
  const formattedAmount = new Intl.NumberFormat("vi-VN").format(amountVnd);

  return (
    <EmailLayout
      preview={`Thanh toán thành công — ${courseTitle}`}
      title="Thanh toán thành công"
    >
      <Section style={contentSection}>
        <Text style={greeting}>Xin chào {customerName},</Text>
        <Text style={paragraph}>
          Thanh toán của bạn đã được xác nhận. Khóa học đã sẵn sàng!
        </Text>

        <Section style={successBox}>
          <Text style={successIcon}>✅</Text>
          <Text style={successText}>Thanh toán thành công</Text>
        </Section>

        <Section style={orderBox}>
          <Text style={orderLabel}>Mã đơn hàng</Text>
          <Text style={orderValue}>{orderCode}</Text>

          <Text style={{ ...orderLabel, marginTop: "12px" }}>Khóa học</Text>
          <Text style={orderValue}>{courseTitle}</Text>

          <Text style={{ ...orderLabel, marginTop: "12px" }}>Đã thanh toán</Text>
          <Text style={orderValueHighlight}>{formattedAmount}₫</Text>
        </Section>

        <Text style={paragraph}>
          Nhấn nút bên dưới để bắt đầu học ngay:
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
          Chúc bạn có trải nghiệm học tập tuyệt vời tại Cột Sống Niết Bàn!
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

const successBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center",
  margin: "16px 0",
};

const successIcon: React.CSSProperties = {
  fontSize: "28px",
  margin: "0 0 4px",
};

const successText: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#15803d",
  margin: 0,
};

const orderBox: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "16px 0",
};

const orderLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: "0 0 2px",
};

const orderValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  fontWeight: "600",
  margin: 0,
};

const orderValueHighlight: React.CSSProperties = {
  fontSize: "20px",
  color: "#15803d",
  fontWeight: "bold",
  margin: 0,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#15803d",
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
