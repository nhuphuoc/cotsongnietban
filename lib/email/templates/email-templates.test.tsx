import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { OrderConfirmationEmail } from "./order-confirmation";
import { PaymentSuccessEmail } from "./payment-success";
import { CourseActivatedEmail } from "./course-activated";
import { WelcomeEmail } from "./welcome";
import { CourseExpiringEmail } from "./course-expiring";

describe("Email templates — render", () => {
  it("OrderConfirmationEmail renders không crash", () => {
    const { container } = render(
      OrderConfirmationEmail({
        customerName: "Nguyễn Văn A",
        courseTitle: "Phục hồi lưng cơ bản",
        amountVnd: 1500000,
        checkoutUrl: "https://pay.payos.vn/test",
        orderCode: "PAYOS-123456789",
      })
    );

    expect(container.innerHTML).toContain("Xác nhận đơn hàng");
    expect(container.innerHTML).toContain("Nguyễn Văn A");
    expect(container.innerHTML).toContain("Phục hồi lưng cơ bản");
    expect(container.innerHTML).toContain("1.500.000");
    expect(container.innerHTML).toContain("PAYOS-123456789");
  });

  it("PaymentSuccessEmail renders không crash", () => {
    const { container } = render(
      PaymentSuccessEmail({
        customerName: "Trần Thị B",
        courseTitle: "Yoga cột sống",
        amountVnd: 2990000,
        courseUrl: "https://cotsongnietban.vn/phong-hoc/courses/yoga",
        orderCode: "PAYOS-987654321",
      })
    );

    expect(container.innerHTML).toContain("Thanh toán thành công");
    expect(container.innerHTML).toContain("Trần Thị B");
    expect(container.innerHTML).toContain("2.990.000");
  });

  it("CourseActivatedEmail renders với expiresAt", () => {
    const { container } = render(
      CourseActivatedEmail({
        customerName: "Lê Văn C",
        courseTitle: "Phục hồi chuyên sâu",
        courseUrl: "https://cotsongnietban.vn/phong-hoc/courses/chuyen-sau",
        expiresAt: new Date("2026-12-21").toISOString(),
      })
    );

    expect(container.innerHTML).toContain("Khóa học đã sẵn sàng");
    expect(container.innerHTML).toContain("Lê Văn C");
    expect(container.innerHTML).toContain("21/12/2026");
  });

  it("CourseActivatedEmail renders không giới hạn", () => {
    const { container } = render(
      CourseActivatedEmail({
        customerName: "Phạm Thị D",
        courseTitle: "Khóa miễn phí",
        courseUrl: "https://cotsongnietban.vn/phong-hoc/courses/free",
        expiresAt: null,
      })
    );

    expect(container.innerHTML).toContain("không giới hạn thời gian");
  });

  it("WelcomeEmail renders không crash", () => {
    const { container } = render(
      WelcomeEmail({
        customerName: "Hoàng Văn E",
        coursesUrl: "https://cotsongnietban.vn/courses",
      })
    );

    expect(container.innerHTML).toContain("Chào mừng bạn");
    expect(container.innerHTML).toContain("Hoàng Văn E");
    expect(container.innerHTML).toContain("Cột Sống Niết Bàn");
  });

  it("CourseExpiringEmail renders urgency cao (1 ngày)", () => {
    const { container } = render(
      CourseExpiringEmail({
        customerName: "Vũ Thị F",
        courseTitle: "Khóa sắp hết",
        daysLeft: 1,
        courseUrl: "https://cotsongnietban.vn/phong-hoc/courses/sap-het",
        expiresAt: "22/06/2026",
      })
    );

    expect(container.innerHTML).toContain("Sắp hết hạn");
    expect(container.innerHTML).toContain("hết hạn vào ngày mai");
  });

  it("CourseExpiringEmail renders urgency trung bình (7 ngày)", () => {
    const { container } = render(
      CourseExpiringEmail({
        customerName: "Ngô Văn G",
        courseTitle: "Khóa 7 ngày",
        daysLeft: 7,
        courseUrl: "https://cotsongnietban.vn/phong-hoc/courses/7ngay",
        expiresAt: "29/06/2026",
      })
    );

    expect(container.innerHTML).toContain("7 ngày");
    expect(container.innerHTML).toContain("29/06/2026");
  });
});
