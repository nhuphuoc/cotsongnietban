import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="bg-[#f5f5f5] min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/landing" className="hover:text-[#c0392b] transition-colors">Trang Chủ</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#c0392b] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600">Bài Viết</span>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[#c0392b] text-sm font-heading font-semibold uppercase tracking-wide mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Quay Lại Blog
        </Link>

        {/* Category */}
        <span className="inline-block bg-[#c0392b] text-white text-xs font-heading font-bold px-3 py-1 rounded-sm uppercase tracking-wide mb-4">
          Liệu Pháp
        </span>

        {/* Title */}
        <h1 className="font-heading font-black text-[#0a0a0a] text-3xl sm:text-4xl leading-tight mb-4">
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
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Thoát vị đĩa đệm là một trong những vấn đề cột sống phổ biến nhất hiện nay, ảnh hưởng đến hàng triệu người Việt Nam. Tuy nhiên, nhiều người vẫn nghĩ rằng phẫu thuật là giải pháp duy nhất — điều này hoàn toàn không đúng.
          </p>

          <h2 className="font-heading font-black text-[#0a0a0a] text-xl uppercase tracking-wide mt-8 mb-4">
            Thoát Vị Đĩa Đệm Là Gì?
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            Đĩa đệm là các đệm nằm giữa các đốt sống, có chức năng hấp thụ lực tác động và cho phép cột sống chuyển động linh hoạt. Khi nhân nhầy bên trong đĩa đệm bị thoát ra ngoài vỏ sợi, nó có thể chèn ép các rễ thần kinh gây đau.
          </p>

          <div className="bg-[#111] border-l-4 border-[#c0392b] rounded-sm p-5 my-6">
            <p className="text-white text-sm leading-relaxed italic">
              &ldquo;95% các trường hợp thoát vị đĩa đệm có thể phục hồi mà không cần phẫu thuật nếu được điều trị đúng phương pháp.&rdquo;
            </p>
            <span className="text-[#a0a0a0] text-xs mt-2 block">— Journal of Spine Surgery, 2023</span>
          </div>

          <h2 className="font-heading font-black text-[#0a0a0a] text-xl uppercase tracking-wide mt-8 mb-4">
            3 Giai Đoạn Phục Hồi
          </h2>
          {[
            { phase: "Giai Đoạn 1 (Tuần 1-4)", title: "Giảm Đau Cấp Tính", desc: "Tập trung vào việc giảm viêm và đau ngay lập tức. Sử dụng các bài tập nhẹ nhàng, tránh các chuyển động gây đau." },
            { phase: "Giai Đoạn 2 (Tuần 4-12)", title: "Phục Hồi Cơ Nền", desc: "Xây dựng sức mạnh cơ lõi, cải thiện sự linh hoạt của cột sống và tái lập các mẫu vận động đúng." },
            { phase: "Giai Đoạn 3 (Từ tuần 12)", title: "Duy Trì & Ngăn Ngừa", desc: "Tích hợp vào lối sống hàng ngày, ngăn ngừa tái phát thông qua vận động đúng cách." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="w-2 bg-[#c0392b] rounded-full shrink-0" />
              <div>
                <span className="text-[#c0392b] text-xs font-heading font-bold uppercase tracking-wide">{item.phase}</span>
                <h3 className="font-heading font-bold text-[#0a0a0a] text-base mt-1 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          <h2 className="font-heading font-black text-[#0a0a0a] text-xl uppercase tracking-wide mt-8 mb-4">
            Kết Luận
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Phục hồi thoát vị đĩa đệm không cần phẫu thuật là hoàn toàn khả thi với phương pháp đúng đắn. Hãy kiên nhẫn và nhất quán — cơ thể bạn có khả năng tự chữa lành tuyệt vời.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-[#c0392b] rounded-sm p-6 text-center">
          <h3 className="font-heading font-black text-white text-xl uppercase mb-2">
            Bắt Đầu Hành Trình Phục Hồi
          </h3>
          <p className="text-white/70 text-sm mb-4">Đăng ký tư vấn miễn phí để nhận lộ trình cá nhân hóa cho bạn.</p>
          <Link
            href="#consult"
            className="inline-block bg-white text-[#c0392b] font-heading font-bold text-sm uppercase tracking-wide px-6 py-3 rounded-sm hover:bg-gray-100 transition-colors"
          >
            Tư Vấn Miễn Phí →
          </Link>
        </div>
      </article>
    </div>
  );
}
