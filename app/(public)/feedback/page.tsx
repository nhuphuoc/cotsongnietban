import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquareQuote, ShieldCheck, Star } from "lucide-react";
import { PublicFeedbackForm } from "@/components/marketing/public-feedback-form";

export const metadata: Metadata = {
  title: "Gửi Feedback | Cột Sống Niết Bàn",
  description: "Gửi phản hồi về trải nghiệm học, tư vấn hoặc kết quả tập luyện tại Cột Sống Niết Bàn.",
};

const highlights = [
  {
    title: "Gửi trực tiếp từ website",
    description: "Phản hồi đi thẳng vào luồng quản trị để đội ngũ xem và xử lý nhanh hơn.",
    icon: MessageSquareQuote,
  },
  {
    title: "Có kiểm duyệt trước khi công khai",
    description: "Bạn có thể cho phép hiển thị public, nhưng nội dung vẫn được kiểm tra trước khi xuất hiện trên site.",
    icon: ShieldCheck,
  },
  {
    title: "Chấm điểm rõ ràng 1–5 sao",
    description: "Đội ngũ admin có thể dùng đánh giá này để theo dõi chất lượng chương trình và từng khóa học.",
    icon: Star,
  },
];

export default function PublicFeedbackPage() {
  return (
    <section className="relative overflow-hidden bg-csnb-bg px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top,0px))] text-white sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,184,107,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(28,92,104,0.36),transparent_34%)]" />
        <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-80" />
        <div className="csnb-ambient-grid absolute inset-0 opacity-50" />
        <div className="csnb-ambient-noise absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-csnb-orange/30 bg-csnb-orange/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-csnb-orange-bright">
            Feedback công khai
          </span>
          <h1 className="mt-5 max-w-xl font-heading text-4xl font-black uppercase leading-none text-white sm:text-5xl">
            Kể lại trải nghiệm thật của bạn
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-csnb-muted sm:text-base">
            Nếu bạn đã theo dõi nội dung, nhận tư vấn hoặc tham gia chương trình của Cột Sống Niết Bàn, hãy để lại phản hồi ngắn gọn nhưng cụ thể. Những phản hồi tốt giúp đội ngũ hiểu điều gì đang hiệu quả, còn phản hồi chưa tốt giúp sửa đúng chỗ.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-csnb-border/70 bg-csnb-surface/60 p-5">
                <item.icon className="size-5 text-csnb-orange-bright" />
                <h2 className="mt-4 text-sm font-bold uppercase tracking-[0.08em] text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-csnb-muted">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/results"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-csnb-border bg-csnb-surface/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-csnb-orange hover:text-csnb-orange-bright"
            >
              Xem kết quả học viên <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/legal/privacy"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-csnb-muted transition-colors hover:text-white"
            >
              Xem chính sách bảo mật
            </Link>
          </div>
        </div>

        <PublicFeedbackForm />
      </div>
    </section>
  );
}
