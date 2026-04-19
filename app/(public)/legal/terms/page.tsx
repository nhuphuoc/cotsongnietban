import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều Khoản Dịch Vụ | Cột Sống Niết Bàn",
  description: "Điều khoản áp dụng khi sử dụng website, đăng ký tài khoản hoặc tham gia chương trình của Cột Sống Niết Bàn.",
};

export default function TermsPage() {
  return (
    <section className="bg-csnb-bg px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top,0px))] text-white sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-csnb-border/70 bg-csnb-surface/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.2)] sm:p-8 lg:p-10">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-csnb-orange-bright">Pháp lý</span>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none">Điều khoản dịch vụ</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-csnb-muted sm:text-base">
          <p>Khi truy cập website hoặc sử dụng các tính năng như đăng ký, mua khóa học, gửi feedback hay nhận tư vấn, bạn đồng ý cung cấp thông tin chính xác và không sử dụng hệ thống cho mục đích gian lận hoặc gây hại.</p>
          <p>Nội dung trên website nhằm mục đích giáo dục, định hướng và hỗ trợ vận động chức năng. Nội dung này không thay thế chẩn đoán hoặc chỉ định điều trị cá nhân hóa từ bác sĩ trong các trường hợp cấp cứu hoặc bệnh lý nghiêm trọng.</p>
          <p>Tài khoản học viên, tài liệu khóa học và nội dung video chỉ được sử dụng cho cá nhân đã đăng ký hợp lệ. Việc chia sẻ trái phép, sao chép hoặc phát tán lại nội dung có thể dẫn đến việc bị khóa quyền truy cập.</p>
          <p>Chúng tôi có thể cập nhật nội dung, giá, chính sách vận hành hoặc các điều khoản liên quan để phù hợp với thực tế cung cấp dịch vụ. Những thay đổi quan trọng sẽ được hiển thị lại trên website.</p>
        </div>
      </div>
    </section>
  );
}
