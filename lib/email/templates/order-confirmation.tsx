import { Section, Text, Link, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

interface OrderConfirmationEmailProps {
  customerName: string;
  courseTitle: string;
  amountVnd: number;
  checkoutUrl: string;
  orderCode: string;
}

export function OrderConfirmationEmail({
  customerName,
  courseTitle,
  amountVnd,
  checkoutUrl,
  orderCode,
}: OrderConfirmationEmailProps) {
  const formattedAmount = new Intl.NumberFormat("vi-VN").format(amountVnd);

  return (
    <EmailLayout
      preview={`Đơn hàng ${orderCode} — ${courseTitle}`}
      title="Xác nhận đơn hàng"
    >
      <Section style={contentSection}>
        <Text style={greeting}>Xin chào {customerName},</Text>
        <Text style={paragraph}>
          Cảm ơn bạn đã đăng ký khóa học tại <strong>Cột Sống Niết Bàn</strong>.
          Dưới đây là thông tin đơn hàng của bạn:
        </Text>

        {/* Order Summary */}
        <Section style={orderBox}>
          <Text style={orderLabel}>Mã đơn hàng</Text>
          <Text style={orderValue}>{orderCode}</Text>

          <Text style={{ ...orderLabel, marginTop: "12px" }}>Khóa học</Text>
          <Text style={orderValue}>{courseTitle}</Text>

          <Text style={{ ...orderLabel, marginTop: "12px" }}>Số tiền</Text>
          <Text style={orderValueHighlight}>{formattedAmount}₫</Text>
        </Section>

        <Text style={paragraph}>
          Vui lòng hoàn tất thanh toán để kích hoạt khóa học. Nhấn nút bên dưới
          để đến trang thanh toán:
        </Text>

        <Button href={checkoutUrl} style={ctaButton}>
          Thanh toán ngay
        </Button>

        <Text style={hint}>
          Nếu nút không hoạt động, sao chép link này:{" "}
          <Link href={checkoutUrl} style={link}>
            {checkoutUrl}
          </Link>
        </Text>

        <Text style={paragraph}>
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
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
  color: "#c0392b",
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
