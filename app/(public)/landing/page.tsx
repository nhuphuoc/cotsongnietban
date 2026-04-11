"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  AlertTriangle,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Users,
  Award,
  Clock,
  MessageCircle,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── MOCK DATA ─────────────────────────────────────────── */
const trustStats = [
  { number: "59,000+", label: "Học Viên Tin Tưởng" },
  { number: "8+", label: "Năm Kinh Nghiệm" },
  { number: "95%", label: "Cải Thiện Sau 30 Ngày" },
  { number: "12+", label: "Khóa Học Chuyên Sâu" },
  { number: "4.9★", label: "Đánh Giá Trung Bình" },
  { number: "24/7", label: "Hỗ Trợ Học Viên" },
];

const problems = [
  {
    icon: AlertTriangle,
    title: "Đau Lưng Mãn Tính",
    desc: "Đau âm ỉ kéo dài nhiều tháng, ảnh hưởng đến sinh hoạt và công việc hàng ngày.",
  },
  {
    icon: Zap,
    title: "Thoát Vị Đĩa Đệm",
    desc: "Đĩa đệm bị tổn thương gây chèn ép dây thần kinh, đau lan xuống chân tay.",
  },
  {
    icon: Target,
    title: "Sai Tư Thế Vận Động",
    desc: "Thói quen ngồi, đứng, đi sai tư thế tích lũy dần gây ra chấn thương.",
  },
  {
    icon: Shield,
    title: "Vai Gáy Căng Cứng",
    desc: "Ngồi máy tính nhiều giờ khiến vai, cổ, gáy bị co cứng và đau nhức.",
  },
  {
    icon: TrendingUp,
    title: "Vận Động Kém Hiệu Quả",
    desc: "Tập gym sai kỹ thuật làm chấn thương tái phát và không đạt kết quả.",
  },
  {
    icon: Clock,
    title: "Phục Hồi Chậm",
    desc: "Sau chấn thương hoặc phẫu thuật, cơ thể không phục hồi hoàn toàn.",
  },
];

const solutions = [
  {
    step: "01",
    title: "Functional Patterns",
    desc: "Phương pháp vận động chức năng theo chuỗi sinh học tự nhiên của cơ thể người.",
  },
  {
    step: "02",
    title: "Corrective Exercise",
    desc: "Bài tập phục hồi có hệ thống, từ nền tảng đến nâng cao theo lộ trình cá nhân.",
  },
  {
    step: "03",
    title: "Movement Reprogramming",
    desc: "Tái lập trình các mẫu vận động sai, xây dựng thói quen chuyển động khỏe mạnh.",
  },
];

const beforeAfterData = [
  {
    name: "Nguyễn Văn A",
    issue: "Thoát vị L4-L5",
    duration: "3 tháng",
    before: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=300&h=400&fit=crop",
  },
  {
    name: "Trần Thị B",
    issue: "Đau lưng mãn tính",
    duration: "2 tháng",
    before: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1549476464-37392f717541?w=300&h=400&fit=crop",
  },
  {
    name: "Lê Minh C",
    issue: "Vai gáy căng cứng",
    duration: "6 tuần",
    before: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop",
    after: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&h=400&fit=crop",
  },
];

const testimonials = [
  {
    name: "Chị Lan Anh",
    role: "Nhân viên văn phòng, 34 tuổi",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop",
    text: "Sau 3 tháng học, cơn đau lưng mãn tính của tôi gần như biến mất hoàn toàn. Tôi có thể ngồi làm việc 8 tiếng mà không đau nữa. Phương pháp này thực sự thay đổi cuộc sống tôi!",
    rating: 5,
  },
  {
    name: "Anh Minh Tuấn",
    role: "Vận động viên, 28 tuổi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    text: "Tôi bị thoát vị đĩa đệm L5-S1 và đã không thể tập luyện 6 tháng. Sau khóa học, tôi đã quay lại thi đấu và thành tích còn tốt hơn trước.",
    rating: 5,
  },
  {
    name: "Chị Thu Hương",
    role: "Giáo viên, 42 tuổi",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    text: "Tôi đứng dạy cả ngày và bị đau gót chân kinh niên. Chỉ 6 tuần với khóa học này, tôi đã đứng thoải mái và không cần uống thuốc giảm đau nữa.",
    rating: 5,
  },
];

const blogPosts = [
  {
    slug: "thoat-vi-dia-dem-va-phuong-phap-phuc-hoi",
    category: "Liệu Pháp",
    title: "Thoát Vị Đĩa Đệm: Phương Pháp Phục Hồi Không Cần Phẫu Thuật",
    excerpt: "Hiểu đúng về thoát vị đĩa đệm và lộ trình phục hồi tự nhiên hiệu quả...",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=250&fit=crop",
    date: "15 tháng 3, 2024",
    readTime: "8 phút đọc",
  },
  {
    slug: "dau-lung-man-tinh-nguyen-nhan-va-giai-phap",
    category: "Đau Lưng",
    title: "Đau Lưng Mãn Tính: 5 Nguyên Nhân Bạn Chưa Biết",
    excerpt: "Đau lưng không chỉ do ngồi sai tư thế — đây là những nguyên nhân ẩn thường bị bỏ qua...",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
    date: "8 tháng 3, 2024",
    readTime: "6 phút đọc",
  },
  {
    slug: "functional-patterns-la-gi",
    category: "Kiến Thức",
    title: "Functional Patterns Là Gì? Tại Sao Nó Thay Đổi Mọi Thứ?",
    excerpt: "Phương pháp vận động chức năng theo chuỗi sinh học — giải thích từ A đến Z...",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop",
    date: "1 tháng 3, 2024",
    readTime: "10 phút đọc",
  },
];

const pricingPlans = [
  {
    id: "truc-tiep",
    name: "Tập Trực Tiếp",
    tag: "TRỰC TIẾP",
    priceFrom: "17TR+",
    tiers: [
      "30 BUỔI — 17.000.000đ (3 tháng)",
      "60 BUỔI — 31.000.000đ (6 tháng)",
      "100 BUỔI — 45.000.000đ (10 tháng)",
    ],
    desc: "Được hướng dẫn bởi coach có bề dày kinh nghiệm về khắc phục bệnh lý cột sống và đau khớp mãn tính.",
    features: [
      "Coach theo sát 1-1 mỗi buổi tập",
      "Buổi giải cơ trị liệu đi kèm",
      "Điều chỉnh lộ trình theo tình trạng từng ngày",
      "Ưu tiên xử lý trường hợp khẩn cấp",
      "Hướng dẫn ăn uống hỗ trợ phục hồi",
    ],
    popular: false,
  },
  {
    id: "zoom",
    name: "Tập Trực Tuyến (Zoom)",
    tag: "ZOOM",
    priceFrom: "14TR+",
    tiers: [
      "30 BUỔI — 14.000.000đ",
      "60 BUỔI — 26.000.000đ",
      "100 BUỔI — 38.000.000đ",
    ],
    desc: "Dành cho những ai ở xa, được hướng dẫn trực tiếp qua gọi điện trực tuyến. Không sợ tập sai.",
    features: [
      "Gọi điện Zoom 1-1 với coach",
      "Chương trình tập theo tình trạng từng ngày",
      "Giải đáp thắc mắc bệnh lý trực tiếp",
      "Theo sát tiến trình liên tục",
      "Linh hoạt lịch tập",
    ],
    popular: true,
  },
  {
    id: "online",
    name: "Online Coaching",
    tag: "ONLINE",
    priceFrom: "Liên hệ",
    tiers: [
      "Đăng ký qua form tư vấn",
      "Lộ trình cá nhân hóa hoàn toàn",
      "Theo sát tiến trình không giới hạn",
    ],
    desc: "Theo sát tiến trình và hướng dẫn cụ thể trong suốt quá trình. Không cần lo tìm phương pháp khác.",
    features: [
      "Lộ trình cá nhân hóa theo tình trạng",
      "Hỗ trợ qua Zalo/tin nhắn mọi lúc",
      "Video bài tập được chọn lọc riêng",
      "Kiến thức bảo vệ cột sống lâu dài",
      "Không giới hạn câu hỏi",
    ],
    popular: false,
  },
];

const faqs = [
  {
    q: "Tôi bị thoát vị 5 năm có tham gia được không?",
    a: "Có. Lộ trình sẽ được điều chỉnh theo nền tảng chịu lực và mức độ đau hiện tại của bạn. Mục tiêu là giảm bù trừ và tăng khả năng vận động an toàn. Trường hợp cần thiết, sẽ tư vấn bạn chụp phim để xem tình trạng có nguy hiểm không.",
  },
  {
    q: "Tập bao lâu thì sẽ thấy rõ hiệu quả?",
    a: "Bạn sẽ cảm thấy nhẹ nhàng hơn ngay sau tuần đầu tiên. Sau đó, giảm đau rõ rệt từ tuần thứ 5 trở đi (trường hợp nặng hơn thì tuần thứ 8). Đây là tập luyện phục hồi thực sự, không giống thuốc giảm đau tức thời. Kiên trì là chìa khóa.",
  },
  {
    q: "Tôi cần dụng cụ gì không?",
    a: "Phần lớn bài tập tối giản và có biến thể phù hợp với người ở nhà. Khi cần thêm dụng cụ, chương trình sẽ hướng dẫn cụ thể.",
  },
  {
    q: "Học online có hiệu quả không?",
    a: "Có. Người học sẽ không sợ bị tập sai vì chương trình được xây dựng theo tình trạng và được theo sát tiến trình. Điều quan trọng là bạn tập trung 100% và làm đúng kỹ thuật.",
  },
  {
    q: "Chương trình có phát triển cơ không?",
    a: "Có. Tập luyện chức năng phát triển nhóm cơ bên trong — cơ bám xương (LOCAL MUSCLES). Khi những cơ này khỏe mạnh, cơ thể được thiết lập lại cấu trúc vững vàng hơn, giảm đau và gân dây chằng cũng được tăng cường.",
  },
  {
    q: "Tôi có được tư vấn trước khi đăng ký không?",
    a: "Hoàn toàn có. Bạn đăng ký tư vấn để được định hướng gói phù hợp với tình trạng của mình. Tư vấn miễn phí và không ràng buộc.",
  },
  {
    q: "Chương trình có giảm mỡ không?",
    a: "Tùy mức độ. Trong chương trình có hướng dẫn ăn uống hỗ trợ để không tạo calories dư thừa. Khi cơ thể khỏe mạnh hơn từng giai đoạn, quá trình giảm mỡ diễn ra suôn sẻ hơn. Cơ thể khỏe mạnh sẽ tạo ra một cơ thể đẹp.",
  },
];

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function LandingPage() {
  const [pricingDialog, setPricingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof pricingPlans)[0] | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", problem: "", goal: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleOpenPricing = (plan: (typeof pricingPlans)[0]) => {
    setSelectedPlan(plan);
    setPricingDialog(true);
  };

  const handleSubmitConsult = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0a0a0a 0%, #1a0505 40%, #0a0a0a 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #c0392b 0px, #c0392b 1px, transparent 1px, transparent 60px)",
            }}
          />
        </div>

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c0392b]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-[#c0392b]/10 border border-[#c0392b]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#c0392b] rounded-full animate-pulse" />
            <span className="text-[#c0392b] text-xs font-heading font-semibold uppercase tracking-widest">
              Phương Pháp Functional Patterns
            </span>
          </div>

          <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-8xl uppercase leading-none tracking-tight mb-6">
            <span className="text-white">Phục Hồi</span>
            <br />
            <span className="text-[#c0392b]">Tự Nhiên</span>
            <br />
            <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
              Trị Liệu Tận Gốc
            </span>
          </h1>

          <p className="text-[#a0a0a0] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Hết đau lưng, thoát vị đĩa đệm, đau vai gáy mà{" "}
            <span className="text-white font-semibold">không cần phẫu thuật</span>.
            Phương pháp khoa học từ hơn{" "}
            <span className="text-[#e67e22] font-bold">59,000+ học viên</span> đã áp dụng.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#consult"
              className="group flex items-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white font-heading font-bold text-base px-8 py-4 rounded-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#c0392b]/30"
            >
              Đăng Ký Tư Vấn Miễn Phí
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/results"
              className="flex items-center gap-2 border border-white/20 hover:border-white/50 text-white font-heading font-semibold text-base px-8 py-4 rounded-sm uppercase tracking-wider transition-all duration-200"
            >
              <Play size={16} className="text-[#c0392b]" />
              Xem Kết Quả Học Viên
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[#a0a0a0] text-xs uppercase tracking-widest font-heading">Khám Phá</span>
            <ChevronDown size={20} className="text-[#a0a0a0]" />
          </div>
        </div>
      </section>

      {/* ── TRUST BANNER ───────────────────────────── */}
      <section className="bg-[#111] border-y border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-0 lg:divide-x lg:divide-[#222]">
            {trustStats.map((stat, i) => (
              <div key={i} className="text-center lg:px-6">
                <div className="font-heading font-black text-2xl lg:text-3xl text-[#e67e22] mb-1">
                  {stat.number}
                </div>
                <div className="text-[#a0a0a0] text-xs uppercase tracking-wide font-heading">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
              Vấn Đề Bạn Đang Gặp
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-white mt-3">
              Bạn Có Đang Chịu Đựng
              <br />
              <span className="text-[#c0392b]">Những Điều Này?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#222] rounded-sm p-6 group hover:border-[#c0392b]/40 transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-[#c0392b]/10 rounded flex items-center justify-center mb-4 group-hover:bg-[#c0392b]/20 transition-colors">
                  <p.icon size={20} className="text-[#c0392b]" />
                </div>
                <h3 className="font-heading font-bold text-white text-base uppercase tracking-wide mb-2">
                  {p.title}
                </h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ───────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#111] border-y border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
                Giải Pháp Của Chúng Tôi
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-white mt-3 mb-6">
                Phương Pháp Khoa Học
                <br />
                <span className="text-[#c0392b]">Đã Được Kiểm Chứng</span>
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed mb-8">
                Không phải thuốc giảm đau, không phải phẫu thuật. Chúng tôi đào tạo bạn
                cách di chuyển đúng cách — giải quyết tận gốc nguyên nhân gây đau.
              </p>
              <Link
                href="#consult"
                className="inline-flex items-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white font-heading font-bold text-sm px-6 py-3 rounded-sm uppercase tracking-wider transition-colors"
              >
                Bắt Đầu Hành Trình <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {solutions.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-5 bg-[#0a0a0a] border border-[#222] rounded-sm p-5 hover:border-[#c0392b]/30 transition-colors"
                >
                  <div className="font-heading font-black text-3xl text-[#c0392b]/30 leading-none w-10 shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wide mb-1.5">
                      {s.title}
                    </h3>
                    <p className="text-[#a0a0a0] text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
              Minh Chứng Thực Tế
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-white mt-3">
              Kết Quả Học Viên
            </h2>
          </div>

          <Tabs defaultValue="before-after" className="w-full">
            <TabsList className="bg-[#111] border border-[#222] rounded-sm p-1 mb-8 flex w-full max-w-md mx-auto">
              <TabsTrigger
                value="before-after"
                className="flex-1 text-xs font-heading font-bold uppercase tracking-wide rounded-sm data-[state=active]:bg-[#c0392b] data-[state=active]:text-white text-[#a0a0a0]"
              >
                Before & After
              </TabsTrigger>
              <TabsTrigger
                value="testimonials"
                className="flex-1 text-xs font-heading font-bold uppercase tracking-wide rounded-sm data-[state=active]:bg-[#c0392b] data-[state=active]:text-white text-[#a0a0a0]"
              >
                Testimonials
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-1 text-xs font-heading font-bold uppercase tracking-wide rounded-sm data-[state=active]:bg-[#c0392b] data-[state=active]:text-white text-[#a0a0a0]"
              >
                Comments
              </TabsTrigger>
            </TabsList>

            {/* Before & After */}
            <TabsContent value="before-after">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {beforeAfterData.map((item, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] rounded-sm overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-[#222]">
                      <div className="relative aspect-[3/4]">
                        <Image src={item.before} alt="Before" fill className="object-cover" />
                        <div className="absolute bottom-2 left-2 bg-[#0a0a0a]/80 text-[#a0a0a0] text-xs px-2 py-1 rounded font-heading">
                          TRƯỚC
                        </div>
                      </div>
                      <div className="relative aspect-[3/4]">
                        <Image src={item.after} alt="After" fill className="object-cover" />
                        <div className="absolute bottom-2 right-2 bg-[#c0392b] text-white text-xs px-2 py-1 rounded font-heading font-bold">
                          SAU
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-heading font-bold text-white text-sm">{item.name}</div>
                      <div className="text-[#c0392b] text-xs mt-0.5">{item.issue}</div>
                      <div className="text-[#a0a0a0] text-xs mt-1">⏱ {item.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Testimonials */}
            <TabsContent value="testimonials">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] rounded-sm p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} className="text-[#e67e22] fill-[#e67e22]" />
                      ))}
                    </div>
                    <p className="text-[#a0a0a0] text-sm leading-relaxed mb-5 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-heading font-bold text-white text-sm">{t.name}</div>
                        <div className="text-[#a0a0a0] text-xs">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Comments */}
            <TabsContent value="comments">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                  <div key={n} className="relative aspect-[9/16] rounded-sm overflow-hidden border border-[#222]">
                    <Image
                      src={`/images/fb${n}.png`}
                      alt={`Feedback ${n}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-10">
            <Link
              href="/results"
              className="inline-flex items-center gap-2 border border-[#333] hover:border-[#c0392b] text-[#a0a0a0] hover:text-white text-sm font-heading font-semibold uppercase tracking-wide px-6 py-3 rounded-sm transition-colors"
            >
              Xem Thêm Kết Quả <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ───────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
                Kiến Thức Nền Tảng
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase text-[#0a0a0a] mt-2">
                Bài Viết Mới Nhất
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1 text-[#c0392b] font-heading font-semibold text-sm uppercase tracking-wide hover:gap-2 transition-all"
            >
              Tất cả bài viết <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
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
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/blog" className="text-[#c0392b] font-heading font-semibold text-sm uppercase tracking-wide">
              Xem tất cả bài viết →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────── */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
              Đầu Tư Cho Sức Khỏe
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-white mt-3">
              Chọn Gói Phù Hợp
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col bg-[#111] border rounded-sm p-6 ${
                  plan.popular
                    ? "border-[#c0392b] shadow-lg shadow-[#c0392b]/10"
                    : "border-[#222]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c0392b] text-white text-xs font-heading font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    Được Chọn Nhiều Nhất
                  </div>
                )}

                {/* Tag + Name */}
                <div className="mb-4">
                  <span className="text-[#a0a0a0] text-xs font-heading font-bold uppercase tracking-widest">
                    {plan.tag}
                  </span>
                  <h3 className="font-heading font-black text-white text-lg uppercase tracking-wide mt-1">
                    {plan.name}
                  </h3>
                  <p className="text-[#a0a0a0] text-xs leading-relaxed mt-2">{plan.desc}</p>
                </div>

                {/* Price from */}
                <div className="font-heading font-black text-3xl text-[#e67e22] mb-3">
                  {plan.priceFrom}
                </div>

                {/* Tiers */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded-sm p-3 mb-4">
                  <div className="text-[#a0a0a0] text-xs font-heading uppercase tracking-wide mb-2">Gói tập</div>
                  <ul className="space-y-1.5">
                    {plan.tiers.map((tier, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#c0392b] mt-1 shrink-0">›</span>
                        <span className="text-white text-xs font-heading">{tier}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[#c0392b] mt-0.5 shrink-0" />
                      <span className="text-[#a0a0a0] text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="#consult"
                  className={`w-full font-heading font-bold text-sm uppercase tracking-wider py-3 rounded-sm transition-colors text-center block ${
                    plan.popular
                      ? "bg-[#c0392b] hover:bg-[#96281b] text-white"
                      : "border border-[#333] hover:border-[#c0392b] text-white"
                  }`}
                >
                  Đăng Ký Tư Vấn
                </Link>
              </div>
            ))}
          </div>

          {/* Schedule hint */}
          <div className="mt-8 max-w-2xl mx-auto bg-[#111] border border-[#222] rounded-sm p-5 text-center">
            <div className="text-[#a0a0a0] text-xs font-heading uppercase tracking-widest mb-2">Lịch Tập Gợi Ý</div>
            <p className="text-white/70 text-sm">
              Người mới thường tập <strong className="text-white">3 buổi/tuần</strong>, mỗi buổi khoảng <strong className="text-white">60 phút</strong>. Online Coaching: linh hoạt hoàn toàn theo lịch của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#111] border-y border-[#222]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
              Câu Hỏi Thường Gặp
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase text-white mt-3">
              FAQ
            </h2>
          </div>

          <Accordion className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-[#0a0a0a] border border-[#222] rounded-sm px-5 hover:border-[#333] transition-colors"
              >
                <AccordionTrigger className="font-heading font-bold text-white text-sm uppercase tracking-wide py-4 hover:no-underline text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#a0a0a0] text-sm leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CONSULT FORM ───────────────────────────── */}
      <section id="consult" className="py-20 lg:py-28 bg-[#c0392b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-white leading-tight">
                Đăng Ký Tư Vấn
                <br />
                <span className="text-white/70">Miễn Phí</span>
              </h2>
              <p className="text-white/80 text-base leading-relaxed mt-4 mb-6">
                Điền thông tin bên dưới để nhận tư vấn miễn phí 1-1 về tình
                trạng của bạn và lộ trình phù hợp nhất.
              </p>
              <div className="space-y-3">
                {[
                  "Tư vấn hoàn toàn miễn phí, không ràng buộc",
                  "Phản hồi trong vòng 2 tiếng",
                  "Lộ trình được cá nhân hóa cho bạn",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-white/60" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm p-6 lg:p-8">
              {formSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="text-white mx-auto mb-4" />
                  <h3 className="font-heading font-black text-white text-xl uppercase mb-2">
                    Đăng Ký Thành Công!
                  </h3>
                  <p className="text-white/70 text-sm">
                    Chúng tôi sẽ liên hệ với bạn trong vòng 2 tiếng. Cảm ơn bạn!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitConsult} className="space-y-4">
                  <div>
                    <Label className="text-white/80 text-xs font-heading uppercase tracking-wide mb-1.5 block">
                      Họ và Tên *
                    </Label>
                    <Input
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80 text-xs font-heading uppercase tracking-wide mb-1.5 block">
                      Số Điện Thoại *
                    </Label>
                    <Input
                      required
                      type="tel"
                      placeholder="0909 xxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80 text-xs font-heading uppercase tracking-wide mb-1.5 block">
                      Vấn Đề Hiện Tại
                    </Label>
                    <select
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white"
                    >
                      <option value="" className="text-black">Chọn vấn đề...</option>
                      <option value="back" className="text-black">Đau lưng mãn tính</option>
                      <option value="disc" className="text-black">Thoát vị đĩa đệm</option>
                      <option value="shoulder" className="text-black">Đau vai gáy</option>
                      <option value="posture" className="text-black">Sai tư thế</option>
                      <option value="other" className="text-black">Khác</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-white/80 text-xs font-heading uppercase tracking-wide mb-1.5 block">
                      Mục Tiêu Của Bạn
                    </Label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả ngắn về tình trạng và mong muốn của bạn..."
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-heading font-bold text-sm uppercase tracking-wider py-3.5 rounded-sm transition-colors"
                  >
                    Gửi Đăng Ký Ngay
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING DIALOG (QR) ────────────────────── */}
      <Dialog open={pricingDialog} onOpenChange={setPricingDialog}>
        <DialogContent className="bg-[#111] border-[#222] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading font-black text-white uppercase tracking-wide">
              Đăng Ký: {selectedPlan?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-sm p-4 text-center">
              <div className="text-[#a0a0a0] text-xs mb-1 uppercase font-heading">Gói Đã Chọn</div>
              <div className="font-heading font-black text-[#e67e22] text-xl">{selectedPlan?.name}</div>
              <div className="text-[#a0a0a0] text-xs mt-1">Từ {selectedPlan?.priceFrom} · Liên hệ để chốt gói cụ thể</div>
            </div>

            {/* QR Placeholder */}
            <div className="bg-white rounded-sm p-4 flex items-center justify-center aspect-square max-w-[200px] mx-auto">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <div className="text-xs text-gray-400 text-center">QR Code<br />Ngân Hàng</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-sm p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">Ngân hàng:</span>
                <span className="text-white font-semibold">VCB / Vietcombank</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">Số TK:</span>
                <span className="text-white font-mono font-semibold">1234567890</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">Chủ TK:</span>
                <span className="text-white font-semibold">NGUYEN VAN A</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">Nội dung CK:</span>
                <span className="text-[#e67e22] font-mono text-xs">CSNB {selectedPlan?.id?.toUpperCase()} [SĐT]</span>
              </div>
            </div>

            <p className="text-[#a0a0a0] text-xs text-center leading-relaxed">
              Sau khi chuyển khoản, admin sẽ xác nhận và mở khóa khóa học cho bạn trong vòng <strong className="text-white">2-4 tiếng</strong>.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPricingDialog(false)}
                className="flex-1 border border-[#333] text-[#a0a0a0] text-sm font-heading font-semibold py-2.5 rounded-sm uppercase tracking-wide hover:border-[#555] transition-colors"
              >
                Đóng
              </button>
              <Link
                href="https://zalo.me"
                target="_blank"
                className="flex-1 bg-[#c0392b] text-white text-sm font-heading font-bold py-2.5 rounded-sm uppercase tracking-wide text-center hover:bg-[#96281b] transition-colors"
              >
                Liên Hệ Zalo
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Zalo Button */}
      <a
        href="https://zalo.me"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#0068FF] hover:bg-[#0051CC] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-colors"
        title="Chat Zalo"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
