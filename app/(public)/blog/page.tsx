import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";

const categories = ["Tất cả", "Đau lưng", "Liệu pháp", "Tư thế", "Dinh dưỡng", "Kiến thức"];

const posts = [
  { slug: "thoat-vi-dia-dem-va-phuong-phap-phuc-hoi", category: "Liệu pháp", title: "Thoát vị đĩa đệm: phương pháp phục hồi không cần phẫu thuật", excerpt: "Hiểu đúng về thoát vị đĩa đệm và lộ trình phục hồi tự nhiên hiệu quả. Bài viết phân tích chi tiết từng giai đoạn phục hồi và các bài tập phù hợp.", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop", date: "15 tháng 3, 2024", readTime: "8 phút đọc" },
  { slug: "dau-lung-man-tinh-nguyen-nhan-va-giai-phap", category: "Đau lưng", title: "Đau lưng mãn tính: 5 nguyên nhân bạn chưa biết", excerpt: "Đau lưng không chỉ do ngồi sai tư thế — đây là những nguyên nhân ẩn thường bị bỏ qua bởi hầu hết mọi người và cả chuyên gia y tế.", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop", date: "8 tháng 3, 2024", readTime: "6 phút đọc" },
  { slug: "functional-patterns-la-gi", category: "Kiến thức", title: "Functional Patterns là gì? Tại sao nó thay đổi mọi thứ?", excerpt: "Phương pháp vận động chức năng theo chuỗi sinh học — giải thích từ A đến Z cho người mới bắt đầu tìm hiểu về phục hồi chức năng.", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop", date: "1 tháng 3, 2024", readTime: "10 phút đọc" },
  { slug: "tu-the-ngoi-dung-cho-dan-van-phong", category: "Tư thế", title: "Tư thế ngồi đúng cho dân văn phòng: hướng dẫn từng bước", excerpt: "8 tiếng ngồi máy tính mỗi ngày có thể hủy hoại cột sống của bạn. Đây là cách ngồi đúng và các bài tập giúp bạn duy trì sức khỏe.", image: "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?w=600&h=400&fit=crop", date: "22 tháng 2, 2024", readTime: "7 phút đọc" },
  { slug: "dau-vai-gay-do-dau-va-cach-tri", category: "Đau lưng", title: "Đau vai gáy do đâu và cách trị dứt điểm", excerpt: "Cơn đau vai gáy dai dẳng không chỉ do ngồi sai tư thế. Tìm hiểu nguyên nhân sâu xa và lộ trình điều trị hiệu quả nhất.", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop", date: "14 tháng 2, 2024", readTime: "9 phút đọc" },
  { slug: "dinh-duong-cho-phuc-hoi-chan-thuong", category: "Dinh dưỡng", title: "Dinh dưỡng hỗ trợ phục hồi chấn thương: những điều cần biết", excerpt: "Thực phẩm và chất dinh dưỡng đóng vai trò quan trọng trong quá trình phục hồi. Xây dựng chế độ ăn hỗ trợ tối ưu cho cơ thể.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop", date: "5 tháng 2, 2024", readTime: "5 phút đọc" },
];

export default function BlogPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-[0.45]" aria-hidden />
      </div>

      <section className="relative z-10 border-b border-csnb-border/20 bg-white/80 py-14 backdrop-blur-sm lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange-deep">
            Kiến thức
          </span>
          <h1 className="mt-3 font-sans text-3xl font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-4xl lg:text-5xl">
            Blog Cột Sống Niết Bàn
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-sans text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base">
            Chia sẻ về phục hồi chức năng, chấn thương và vận động an toàn.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-40 border-b border-csnb-border/20 bg-white/90 backdrop-blur-md lg:top-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
            {categories.map((cat, i) => (
              <button
                key={cat}
                type="button"
                className={`shrink-0 rounded-full px-4 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs ${
                  i === 0
                    ? "bg-csnb-orange text-white shadow-sm"
                    : "border border-csnb-border/30 bg-white text-neutral-600 hover:border-csnb-orange/40 hover:text-csnb-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="relative z-10 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/blog/${posts[0].slug}`}
            className="group mb-10 grid gap-0 overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-[0_8px_40px_-12px_rgba(6,38,44,0.12)] transition-shadow hover:shadow-[0_16px_48px_-14px_rgba(6,38,44,0.18)] lg:mb-12 lg:grid-cols-2"
          >
            <div className="relative aspect-video min-h-[200px] lg:aspect-auto lg:min-h-[280px]">
              <Image
                src={posts[0].image}
                alt={posts[0].title}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-10">
              <span className="mb-3 inline-flex w-fit rounded-md bg-csnb-orange px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white">
                {posts[0].category}
              </span>
              <h2 className="mb-3 font-sans text-xl font-extrabold leading-snug text-csnb-ink sm:text-2xl lg:text-[1.65rem]">
                {posts[0].title}
              </h2>
              <p className="mb-5 font-sans text-sm leading-relaxed text-neutral-600 sm:text-[0.9375rem]">{posts[0].excerpt}</p>
              <div className="flex flex-wrap items-center gap-4 font-sans text-xs text-neutral-500">
                <span>{posts[0].date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 shrink-0 text-csnb-orange-deep" />
                  {posts[0].readTime}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-csnb-orange-deep transition-all group-hover:gap-2">
                  Đọc bài
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {posts.slice(1).map((post, i) => (
              <Link
                key={i}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-csnb-orange px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 line-clamp-2 font-sans text-base font-bold leading-snug text-csnb-ink transition-colors group-hover:text-csnb-orange-deep">
                    {post.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 font-sans text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
                  <div className="flex items-center justify-between font-sans text-xs text-neutral-500">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-csnb-orange-deep/90" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
