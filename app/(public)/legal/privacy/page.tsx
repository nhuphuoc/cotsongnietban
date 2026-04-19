import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật | Cột Sống Niết Bàn",
  description: "Thông tin về cách Cột Sống Niết Bàn thu thập, lưu trữ và sử dụng dữ liệu cá nhân.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-csnb-bg px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top,0px))] text-white sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-csnb-border/70 bg-csnb-surface/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.2)] sm:p-8 lg:p-10">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-csnb-orange-bright">Pháp lý</span>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none">Chính sách bảo mật</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-csnb-muted sm:text-base">
          <p>Cột Sống Niết Bàn thu thập các thông tin cần thiết như họ tên, email, số điện thoại hoặc nội dung phản hồi khi bạn chủ động gửi qua biểu mẫu, đăng ký tư vấn hoặc đăng nhập.</p>
          <p>Dữ liệu được dùng để liên hệ hỗ trợ, xác thực tài khoản, quản lý đơn hàng, cải thiện nội dung khóa học và xử lý phản hồi khách hàng. Chúng tôi không bán dữ liệu cá nhân cho bên thứ ba.</p>
          <p>Một số dữ liệu có thể được lưu trong các dịch vụ hạ tầng như Supabase hoặc các công cụ email nội bộ nhằm phục vụ vận hành. Việc truy cập dữ liệu được giới hạn cho người có trách nhiệm quản trị.</p>
          <p>Bạn có thể yêu cầu chỉnh sửa hoặc xóa thông tin đã cung cấp bằng cách liên hệ đội ngũ hỗ trợ qua các kênh hiển thị trên website. Với các dữ liệu liên quan giao dịch hoặc nghĩa vụ lưu trữ, chúng tôi có thể cần giữ lại trong phạm vi pháp luật cho phép.</p>
        </div>
      </div>
    </section>
  );
}
