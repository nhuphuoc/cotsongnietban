import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-csnb-panel pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="transition-colors hover:text-csnb-orange">
              Trang Chủ
            </Link>
            <span>/</span>
            <Link href="/blog" className="transition-colors hover:text-csnb-orange">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-600">Bài Viết</span>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* Back */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-csnb-orange transition-all hover:gap-3"
        >
          <ArrowLeft size={16} /> Quay Lại Blog
        </Link>

        {/* Category */}
        <span className="mb-4 inline-block rounded-sm bg-csnb-orange px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide text-white">
          Liệu Pháp
        </span>

        {/* Title */}
        <h1 className="mb-4 font-heading text-3xl font-black leading-tight text-csnb-ink sm:text-4xl">
          Thoát Vị Đĩa Đệm: Phương Pháp Phục Hồi Không Cần Phẫu Thuật
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> 15 tháng 3, 2024</span>
          <span className="flex items-center gap-1.5"><Clock size={14} /> 8 phút đọc</span>
        </div>

        {/* Thumbnail */}
        <div className="relative aspect-video rounded-sm overflow-hidden mb-8">
          <Image
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=450&fit=crop"
            alt="Thoát vị đĩa đệm"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Thoát vị đĩa đệm là một trong những vấn đề cột sống phổ biến nhất hiện nay, ảnh hưởng đến hàng triệu người Việt Nam. Tuy nhiên, nhiều người vẫn nghĩ rằng phẫu thuật là giải pháp duy nhất — điều này hoàn toàn không đúng.
          </p>

          <h2 className="mt-8 mb-4 font-heading text-xl font-black uppercase tracking-wide text-csnb-ink">
            Thoát Vị Đĩa Đệm Là Gì?
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            Đĩa đệm là các đệm nằm giữa các đốt sống, có chức năng hấp thụ lực tác động và cho phép cột sống chuyển động linh hoạt. Khi nhân nhầy bên trong đĩa đệm bị thoát ra ngoài vỏ sợi, nó có thể chèn ép các rễ thần kinh gây đau.
          </p>

          <div className="my-6 rounded-sm border-l-4 border-csnb-orange bg-csnb-surface p-5">
            <p className="text-sm italic leading-relaxed text-white">
              &ldquo;95% các trường hợp thoát vị đĩa đệm có thể phục hồi mà không cần phẫu thuật nếu được điều trị đúng phương pháp.&rdquo;
            </p>
            <span className="mt-2 block text-xs text-csnb-muted">— Journal of Spine Surgery, 2023</span>
          </div>

          <h2 className="mt-8 mb-4 font-heading text-xl font-black uppercase tracking-wide text-csnb-ink">
            3 Giai Đoạn Phục Hồi
          </h2>
          {[
            { phase: "Giai Đoạn 1 (Tuần 1-4)", title: "Giảm Đau Cấp Tính", desc: "Tập trung vào việc giảm viêm và đau ngay lập tức. Sử dụng các bài tập nhẹ nhàng, tránh các chuyển động gây đau." },
            { phase: "Giai Đoạn 2 (Tuần 4-12)", title: "Phục Hồi Cơ Nền", desc: "Xây dựng sức mạnh cơ lõi, cải thiện sự linh hoạt của cột sống và tái lập các mẫu vận động đúng." },
            { phase: "Giai Đoạn 3 (Từ tuần 12)", title: "Duy Trì & Ngăn Ngừa", desc: "Tích hợp vào lối sống hàng ngày, ngăn ngừa tái phát thông qua vận động đúng cách." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="w-2 shrink-0 rounded-full bg-csnb-orange" />
              <div>
                <span className="font-heading text-xs font-bold uppercase tracking-wide text-csnb-orange">{item.phase}</span>
                <h3 className="mt-1 mb-1 font-heading text-base font-bold text-csnb-ink">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          <h2 className="mt-8 mb-4 font-heading text-xl font-black uppercase tracking-wide text-csnb-ink">
            Kết Luận
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Phục hồi thoát vị đĩa đệm không cần phẫu thuật là hoàn toàn khả thi với phương pháp đúng đắn. Hãy kiên nhẫn và nhất quán — cơ thể bạn có khả năng tự chữa lành tuyệt vời.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-sm bg-csnb-orange p-6 text-center">
          <h3 className="mb-2 font-heading text-xl font-black uppercase text-white">Bắt Đầu Hành Trình Phục Hồi</h3>
          <p className="mb-4 text-sm text-white/85">
            Xem bảng giá và chọn gói phù hợp — hoặc nhắn Zalo để team hỗ trợ định hướng lộ trình.
          </p>
          <Link
            href="/#pricing"
            className="inline-block rounded-sm bg-white px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-csnb-orange-deep transition-colors hover:bg-csnb-panel"
          >
            Xem khóa học →
          </Link>
        </div>
      </article>
    </div>
  );
}
