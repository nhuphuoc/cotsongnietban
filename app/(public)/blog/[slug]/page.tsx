import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  void params.slug;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-csnb-panel/40 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-40" aria-hidden />
      </div>

      <div className="relative z-10 border-b border-csnb-border/20 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <nav className="flex flex-wrap items-center gap-2 font-sans text-xs text-neutral-500" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-csnb-orange-deep">
              Trang chủ
            </Link>
            <span className="text-csnb-border/60" aria-hidden>
              /
            </span>
            <Link href="/blog" className="transition-colors hover:text-csnb-orange-deep">
              Blog
            </Link>
            <span className="text-csnb-border/60" aria-hidden>
              /
            </span>
            <span className="text-csnb-ink">Bài viết</span>
          </nav>
        </div>
      </div>

      <article className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-csnb-orange-deep transition-all hover:gap-3 hover:text-csnb-orange"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Quay lại blog
        </Link>

        <span className="mb-4 inline-block rounded-md bg-csnb-orange px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white">
          Liệu pháp
        </span>

        <h1 className="mb-4 font-sans text-3xl font-extrabold leading-tight tracking-normal text-csnb-ink sm:text-4xl">
          Thoát vị đĩa đệm: phương pháp phục hồi không cần phẫu thuật
        </h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 font-sans text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0 text-csnb-orange-deep" />
            15 tháng 3, 2024
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-csnb-orange-deep" />
            8 phút đọc
          </span>
        </div>

        <div className="relative mb-10 aspect-video overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=450&fit=crop"
            alt="Thoát vị đĩa đệm"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>

        <div className="font-sans">
          <p className="mb-6 text-[0.9375rem] leading-relaxed text-neutral-700 sm:text-base">
            Thoát vị đĩa đệm là một trong những vấn đề cột sống phổ biến nhất hiện nay, ảnh hưởng đến hàng triệu người Việt Nam. Tuy nhiên, nhiều người vẫn nghĩ rằng phẫu thuật là giải pháp duy nhất — điều này hoàn toàn không đúng.
          </p>

          <h2 className="mt-8 mb-4 font-sans text-lg font-extrabold uppercase tracking-normal text-csnb-ink sm:text-xl">
            Thoát vị đĩa đệm là gì?
          </h2>
          <p className="mb-4 text-[0.9375rem] leading-relaxed text-neutral-700 sm:text-base">
            Đĩa đệm là các đệm nằm giữa các đốt sống, có chức năng hấp thụ lực tác động và cho phép cột sống chuyển động linh hoạt. Khi nhân nhầy bên trong đĩa đệm bị thoát ra ngoài vỏ sợi, nó có thể chèn ép các rễ thần kinh gây đau.
          </p>

          <div className="my-6 rounded-xl border border-csnb-border/30 border-l-4 border-l-csnb-orange bg-white p-5 shadow-sm">
            <p className="text-sm italic leading-relaxed text-csnb-ink">
              &ldquo;95% các trường hợp thoát vị đĩa đệm có thể phục hồi mà không cần phẫu thuật nếu được điều trị đúng phương pháp.&rdquo;
            </p>
            <span className="mt-2 block text-xs text-neutral-500">— Journal of Spine Surgery, 2023</span>
          </div>

          <h2 className="mt-8 mb-4 font-sans text-lg font-extrabold uppercase tracking-normal text-csnb-ink sm:text-xl">
            3 giai đoạn phục hồi
          </h2>
          {[
            { phase: "Giai đoạn 1 (tuần 1–4)", title: "Giảm đau cấp tính", desc: "Tập trung vào việc giảm viêm và đau ngay lập tức. Sử dụng các bài tập nhẹ nhàng, tránh các chuyển động gây đau." },
            { phase: "Giai đoạn 2 (tuần 4–12)", title: "Phục hồi cơ nền", desc: "Xây dựng sức mạnh cơ lõi, cải thiện sự linh hoạt của cột sống và tái lập các mẫu vận động đúng." },
            { phase: "Giai đoạn 3 (từ tuần 12)", title: "Duy trì & ngăn ngừa", desc: "Tích hợp vào lối sống hàng ngày, ngăn ngừa tái phát thông qua vận động đúng cách." },
          ].map((item, i) => (
            <div key={i} className="mb-5 flex gap-4">
              <div className="mt-1 w-1 shrink-0 rounded-full bg-csnb-orange" aria-hidden />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-csnb-orange-deep">{item.phase}</span>
                <h3 className="mt-1 text-base font-bold text-csnb-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.desc}</p>
              </div>
            </div>
          ))}

          <h2 className="mt-8 mb-4 font-sans text-lg font-extrabold uppercase tracking-normal text-csnb-ink sm:text-xl">
            Kết luận
          </h2>
          <p className="mb-6 text-[0.9375rem] leading-relaxed text-neutral-700 sm:text-base">
            Phục hồi thoát vị đĩa đệm không cần phẫu thuật là hoàn toàn khả thi với phương pháp đúng đắn. Hãy kiên nhẫn và nhất quán — cơ thể bạn có khả năng tự chữa lành tuyệt vời.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-csnb-orange/25 bg-gradient-to-br from-csnb-orange to-csnb-orange-deep p-6 text-center shadow-lg shadow-black/10 sm:p-8">
          <h3 className="font-sans text-xl font-extrabold text-white sm:text-2xl">Bắt đầu hành trình phục hồi</h3>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-white/90">
            Xem bảng giá và chọn gói phù hợp — hoặc liên hệ tư vấn trực tiếp để team hỗ trợ định hướng lộ trình.
          </p>
          <Link
            href="/#pricing"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-6 py-3 font-sans text-sm font-bold text-csnb-orange-deep transition-colors hover:bg-csnb-panel"
          >
            Xem khóa học
          </Link>
        </div>
      </article>
    </div>
  );
}
