/** Hiển thị giá VND kiểu Việt Nam (không có khoảng trắng nhỏ). */
export function formatVnd(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount) || amount < 0) {
    return "Liên hệ";
  }
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}
