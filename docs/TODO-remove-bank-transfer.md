# TODO: Gỡ hẳn flow thanh toán chuyển khoản thủ công

Hiện **UI checkout công khai** chỉ còn PayOS (`ENABLE_BANK_TRANSFER_CHECKOUT = false` trong `components/marketing/course-enrollment-checkout.tsx`). API và admin vẫn phục vụ đơn CK cũ.

Khi quyết định xóa hoàn toàn, làm lần lượt:

1. [ ] Xóa `POST /api/orders` (tạo đơn bank) và `POST /api/orders/[id]/confirm-transfer` nếu không còn client.
2. [ ] Xóa test `app/api/orders/orders-public-api.test.ts` hoặc thu gọn chỉ phần còn dùng.
3. [ ] Dọn `lib/api/repositories.ts` / copy UI: bỏ nhánh `bank_transfer` trong comment logic nếu không còn đơn mới.
4. [ ] Trang chủ: dialog pricing có khối hiển thị STK demo — thay bằng CTA PayOS / Zalo hoặc xóa (`app/(public)/page.tsx`).
5. [ ] Admin **Quản lý đơn**: giữ lịch sử đơn cũ hay migration trạng thái — quyết định sản phẩm.
6. [ ] Xóa file này và constant `ENABLE_BANK_TRANSFER_CHECKOUT`.
