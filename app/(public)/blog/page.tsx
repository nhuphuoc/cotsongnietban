import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";

const categories = ["Tất Cả", "Đau Lưng", "Liệu Pháp", "Tư Thế", "Dinh Dưỡng", "Kiến Thức"];

const posts = [
  { slug: "thoat-vi-dia-dem-va-phuong-phap-phuc-hoi", category: "Liệu Pháp", title: "Thoát Vị Đĩa Đệm: Phương Pháp Phục Hồi Không Cần Phẫu Thuật", excerpt: "Hiểu đúng về thoát vị đĩa đệm và lộ trình phục hồi tự nhiên hiệu quả. Bài viết phân tích chi tiết từng giai đoạn phục hồi và các bài tập phù hợp.", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop", date: "15 tháng 3, 2024", readTime: "8 phút đọc" },
  { slug: "dau-lung-man-tinh-nguyen-nhan-va-giai-phap", category: "Đau Lưng", title: "Đau Lưng Mãn Tính: 5 Nguyên Nhân Bạn Chưa Biết", excerpt: "Đau lưng không chỉ do ngồi sai tư thế — đây là những nguyên nhân ẩn thường bị bỏ qua bởi hầu hết mọi người và cả chuyên gia y tế.", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop", date: "8 tháng 3, 2024", readTime: "6 phút đọc" },
  { slug: "functional-patterns-la-gi", category: "Kiến Thức", title: "Functional Patterns Là Gì? Tại Sao Nó Thay Đổi Mọi Thứ?", excerpt: "Phương pháp vận động chức năng theo chuỗi sinh học — giải thích từ A đến Z cho người mới bắt đầu tìm hiểu về phục hồi chức năng.", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop", date: "1 tháng 3, 2024", readTime: "10 phút đọc" },
  { slug: "tu-the-ngoi-dung-cho-dan-van-phong", category: "Tư Thế", title: "Tư Thế Ngồi Đúng Cho Dân Văn Phòng: Hướng Dẫn Từng Bước", excerpt: "8 tiếng ngồi máy tính mỗi ngày có thể hủy hoại cột sống của bạn. Đây là cách ngồi đúng và các bài tập giúp bạn duy trì sức khỏe.", image: "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?w=600&h=400&fit=crop", date: "22 tháng 2, 2024", readTime: "7 phút đọc" },
  { slug: "dau-vai-gay-do-dau-va-cach-tri", category: "Đau Lưng", title: "Đau Vai Gáy Do Đâu Và Cách Trị Dứt Điểm", excerpt: "Cơn đau vai gáy dai dẳng không chỉ do ngồi sai tư thế. Tìm hiểu nguyên nhân sâu xa và lộ trình điều trị hiệu quả nhất.", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop", date: "14 tháng 2, 2024", readTime: "9 phút đọc" },
  { slug: "dinh-duong-cho-phuc-hoi-chan-thuong", category: "Dinh Dưỡng", title: "Dinh Dưỡng Hỗ Trợ Phục Hồi Chấn Thương: Những Điều Cần Biết", excerpt: "Thực phẩm và chất dinh dưỡng đóng vai trò quan trọng trong quá trình phục hồi. Xây dựng chế độ ăn hỗ trợ tối ưu cho cơ thể.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop", date: "5 tháng 2, 2024", readTime: "5 phút đọc" },
];

export default function BlogPage() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-[#0a0a0a] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
            Knowledge Vault
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl uppercase text-white mt-3">
            Blog Kiến Thức
          </h1>
          <p className="text-[#a0a0a0] text-base mt-3 max-w-lg mx-auto">
            Thông tin chuyên sâu về phục hồi chức năng, chấn thương và vận động khỏe mạnh
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wide transition-colors ${
                  i === 0
                    ? "bg-[#c0392b] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured */}
          <Link
            href={`/blog/${posts[0].slug}`}
            className="group grid lg:grid-cols-2 gap-0 bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-8 border border-gray-100"
          >
            <div className="relative aspect-video lg:aspect-auto lg:min-h-[300px]">
              <Image
                src={posts[0].image}
                alt={posts[0].title}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className="inline-block bg-[#c0392b] text-white text-xs font-heading font-bold px-2 py-1 rounded-sm uppercase tracking-wide mb-3 w-fit">
                {posts[0].category}
              </span>
              <h2 className="font-heading font-black text-[#0a0a0a] text-2xl leading-snug mb-3 group-hover:text-[#c0392b] transition-colors">
                {posts[0].title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{posts[0].excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{posts[0].date}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {posts[0].readTime}</span>
              </div>
            </div>
          </Link>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post, i) => (
              <Link
                key={i}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#c0392b] text-white text-xs font-heading font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-[#0a0a0a] text-base leading-snug mb-2 group-hover:text-[#c0392b] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
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
