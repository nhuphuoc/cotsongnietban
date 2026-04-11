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
  Clock,
  MessageCircle,
  HelpCircle,
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
    a: "Hoàn toàn có. Bạn có thể xem bảng giá và chọn gói phù hợp, hoặc nhắn Zalo để team hỗ trợ định hướng theo tình trạng của bạn — không ràng buộc.",
  },
  {
    q: "Chương trình có giảm mỡ không?",
    a: "Tùy mức độ. Trong chương trình có hướng dẫn ăn uống hỗ trợ để không tạo calories dư thừa. Khi cơ thể khỏe mạnh hơn từng giai đoạn, quá trình giảm mỡ diễn ra suôn sẻ hơn. Cơ thể khỏe mạnh sẽ tạo ra một cơ thể đẹp.",
  },
];

const differenceCards = [
  {
    title: "Dựa trên khoa học",
    desc: "Functional Patterns & Corrective Exercise được áp dụng có hệ thống, phù hợp giải phẫu học.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=380&fit=crop",
  },
  {
    title: "Lớp học tương tác",
    desc: "Zoom 1-1 hoặc nhóm nhỏ — coach quan sát tư thế và điều chỉnh từng động tác của bạn.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=380&fit=crop",
  },
  {
    title: "Bắt đầu đúng mức của bạn",
    desc: "Không ép tải — lộ trình theo từng giai đoạn, an toàn cho người đau mãn tính.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=380&fit=crop",
  },
  {
    title: "Theo dõi tiến trình",
    desc: "Ghi nhận cải thiện đau, tư thế và sức bền để bạn thấy rõ từng bước tiến.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=380&fit=crop",
  },
];

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function LandingPage() {
  const [pricingDialog, setPricingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof pricingPlans)[0] | null>(null);

  const handleOpenPricing = (plan: (typeof pricingPlans)[0]) => {
    setSelectedPlan(plan);
    setPricingDialog(true);
  };

  return (
    <div className="bg-csnb-bg text-white antialiased">
      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-csnb-bg pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&h=1080&fit=crop&q=75"
            alt=""
            fill
            priority
            className="scale-110 object-cover opacity-[0.28] blur-2xl saturate-[1.15]"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-csnb-bg via-csnb-bg/90 to-csnb-raised/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-csnb-bg via-transparent to-csnb-bg/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_20%,rgba(255,184,107,0.12),transparent_50%)]" />
        </div>
        <div className="pointer-events-none absolute -right-24 top-20 z-[1] h-80 w-80 rounded-full bg-csnb-orange/20 blur-3xl lg:right-10" />
        <div className="pointer-events-none absolute -left-20 bottom-10 z-[1] h-64 w-64 rounded-full bg-csnb-orange/15 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 sm:pb-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="text-center lg:text-left">
            <p className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.2em] text-csnb-orange">
              Phục hồi chức năng · Online &amp; trực tiếp
            </p>
            <h1 className="font-heading text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              Chương trình tập &amp; phục hồi được thiết kế{" "}
              <span className="relative inline-block text-csnb-orange">
                <span className="relative z-10">dành riêng cho bạn.</span>
                <span
                  className="absolute -bottom-0.5 left-0 right-0 z-0 h-3 rounded-sm bg-csnb-orange/35 sm:h-3.5"
                  aria-hidden
                />
              </span>
            </h1>

            <div className="mx-auto mt-8 max-w-lg lg:mx-0">
              <p className="font-heading text-5xl font-black tracking-tight text-csnb-orange-bright sm:text-6xl">
                95<span className="text-3xl text-white sm:text-4xl">%</span>
              </p>
              <p className="mt-2 text-base leading-relaxed text-csnb-muted sm:text-lg">
                học viên ghi nhận cải thiện rõ sau khi áp dụng đúng lộ trình —{" "}
                <span className="border-b-[3px] border-csnb-orange-bright font-semibold text-white">
                  hướng tới giảm đau bền vững
                </span>
                , không phụ thuộc phẫu thuật.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/#pricing"
                className="group inline-flex items-center gap-3 rounded-sm bg-csnb-orange px-7 py-3.5 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-csnb-orange/30 transition-colors hover:bg-csnb-orange-deep"
              >
                Xem khóa học
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </Link>
              <Link
                href="/results"
                className="inline-flex items-center gap-2 rounded-sm border border-white/25 bg-transparent px-6 py-3.5 font-heading text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-white/50 hover:bg-white/5"
              >
                <Play size={16} className="text-csnb-orange" />
                Xem kết quả
              </Link>
            </div>

            <div className="mt-14 hidden flex-col items-center gap-2 text-csnb-muted sm:flex lg:hidden">
              <span className="font-heading text-[10px] uppercase tracking-widest">Cuộn để khám phá</span>
              <ChevronDown size={20} />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=1125&fit=crop"
                alt="Học viên tập luyện an toàn"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 90vw, 45vw"
                priority
              />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-sm border border-csnb-border bg-csnb-surface p-5 text-white shadow-xl sm:left-6 sm:right-auto sm:max-w-sm">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">
                Bắt đầu hành trình hôm nay
              </p>
              <p className="mt-1 text-sm text-csnb-muted">
                Đồng hành cùng coach — lộ trình rõ ràng, tập đúng cách từ buổi đầu.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {testimonials.slice(0, 3).map((t) => (
                    <div
                      key={t.name}
                      className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-csnb-bg"
                    >
                      <Image src={t.avatar} alt="" fill className="object-cover" sizes="36px" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-csnb-muted">Hàng chục nghìn người đã chọn phương pháp này.</p>
              </div>
              <Link
                href="/#pricing"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-csnb-orange py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
              >
                Bảng giá &amp; gói tập
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BANNER ───────────────────────────── */}
      <section className="border-y border-csnb-border bg-csnb-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-0 lg:divide-x lg:divide-csnb-border">
            {trustStats.map((stat, i) => (
              <div key={i} className="text-center lg:px-4">
                <div className="font-heading text-2xl font-black text-csnb-orange-bright lg:text-3xl">
                  <span className="underline decoration-[3px] decoration-csnb-orange underline-offset-4">
                    {stat.number}
                  </span>
                </div>
                <div className="mt-2 font-heading text-[10px] font-semibold uppercase tracking-wide text-csnb-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT HIGHLIGHT ────────────────────────── */}
      <section className="bg-csnb-bg py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-csnb-orange">
              Phương pháp riêng biệt
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase leading-tight text-white sm:text-4xl lg:text-5xl">
              Phục hồi chức năng
              <br />
              <span className="text-csnb-orange">theo chuỗi sinh học</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-csnb-muted">
              Chúng tôi không chỉ &ldquo;cho bài tập&rdquo; — mà tái thiết lập cách cơ thể chịu lực, giảm bù trừ và
              giảm đau lưng, cổ, khớp theo hướng bền vững.
            </p>
            <Link
              href="/#pricing"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-csnb-orange px-6 py-3 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
            >
              Xem khóa học
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-sm shadow-xl ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=720&fit=crop"
                alt="Tập tại nhà cùng coach online"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 right-4 max-w-[240px] rounded-sm border border-csnb-border bg-csnb-surface p-4 shadow-lg sm:right-6">
              <p className="font-heading text-3xl font-black text-csnb-orange-bright">
                +25<span className="text-xl text-white">%</span>
              </p>
              <p className="mt-1 text-xs leading-snug text-csnb-muted">
                cải thiện sức bền &amp; giữ tư thế theo khảo sát nội bộ học viên sau 8 tuần.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ──────────────────────────────── */}
      <section className="border-y border-csnb-border bg-csnb-orange py-12 text-white lg:py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <h3 className="font-heading text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Trở thành học viên Cột Sống Niết Bàn
            </h3>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              Chọn gói phù hợp hoặc nhắn Zalo — team đồng hành định hướng lộ trình theo tình trạng của bạn.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 3).map((t) => (
                <div
                  key={`cta-${t.name}`}
                  className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-csnb-orange-deep"
                >
                  <Image src={t.avatar} alt="" fill className="object-cover" sizes="44px" />
                </div>
              ))}
            </div>
            <Link
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-white/30 bg-csnb-bg px-6 py-3 font-heading text-xs font-black uppercase tracking-wide text-white shadow-md transition-colors hover:bg-csnb-raised"
            >
              Chat Zalo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIFFERENCE GRID ────────────────────────── */}
      <section className="bg-csnb-panel py-20 text-csnb-ink lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-lg font-heading text-3xl font-black uppercase sm:text-4xl">
              Điều gì tạo nên sự khác biệt?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600 lg:text-right">
              Kết hợp kiến thức phục hồi chức năng với theo sát thực tế — để bạn tự tin vận động mỗi ngày.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differenceCards.map((card) => (
              <div
                key={card.title}
                className="group overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm transition-shadow hover:border-csnb-orange/30 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-csnb-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-sm border border-neutral-200 bg-white px-6 py-5 text-center sm:px-10">
            <p className="font-heading text-lg font-black sm:text-xl">
              <span className="text-2xl text-csnb-orange-bright sm:text-3xl">+12%</span>{" "}
              <span className="underline decoration-csnb-orange decoration-4 underline-offset-4">
                cải thiện linh hoạt cột sống
              </span>{" "}
              trung bình sau 6 tuần theo báo cáo tự đánh giá học viên.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────── */}
      <section className="bg-csnb-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-csnb-orange">
              Vấn đề bạn đang gặp
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase text-white sm:text-4xl lg:text-5xl">
              Bạn có đang chịu đựng
              <br />
              <span className="text-csnb-orange">những điều này?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((p, i) => (
              <div
                key={i}
                className="group rounded-sm border border-csnb-border bg-csnb-surface p-6 transition-all duration-300 hover:border-csnb-orange/40"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-csnb-orange/10 transition-colors group-hover:bg-csnb-orange/20">
                  <p.icon size={20} className="text-csnb-orange" />
                </div>
                <h3 className="mb-2 font-heading text-base font-bold uppercase tracking-wide text-white">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-csnb-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ───────────────────────────────── */}
      <section className="border-y border-csnb-border bg-csnb-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-csnb-orange">
                Giải pháp của chúng tôi
              </span>
              <h2 className="mb-6 mt-3 font-heading text-3xl font-black uppercase text-white sm:text-4xl lg:text-5xl">
                Phương pháp khoa học
                <br />
                <span className="text-csnb-orange">đã được kiểm chứng</span>
              </h2>
              <p className="mb-8 max-w-lg text-base leading-relaxed text-csnb-muted">
                Không phải thuốc giảm đau, không phải phẫu thuật. Chúng tôi đào tạo bạn cách di chuyển đúng — giải
                quyết tận gốc nguyên nhân gây đau.
              </p>
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 rounded-sm bg-csnb-orange px-6 py-3 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
              >
                Bắt đầu hành trình <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {solutions.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-5 rounded-sm border border-csnb-border bg-csnb-bg p-5 transition-colors hover:border-csnb-orange/30"
                >
                  <div className="w-10 shrink-0 font-heading text-3xl font-black leading-none text-csnb-orange/30">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-heading text-sm font-bold uppercase tracking-wide text-white">
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-csnb-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ────────────────────────────────── */}
      <section className="bg-csnb-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-csnb-orange">
              Minh chứng thực tế
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase text-white sm:text-4xl lg:text-5xl">
              Kết quả học viên
            </h2>
          </div>

          <Tabs defaultValue="before-after" className="w-full">
            <TabsList className="mx-auto mb-8 flex w-full max-w-md rounded-sm border border-csnb-border bg-csnb-surface p-1">
              <TabsTrigger
                value="before-after"
                className="flex-1 rounded-sm font-heading text-[10px] font-bold uppercase tracking-wide text-csnb-muted data-[state=active]:bg-csnb-orange data-[state=active]:text-white sm:text-xs"
              >
                Before & After
              </TabsTrigger>
              <TabsTrigger
                value="testimonials"
                className="flex-1 rounded-sm font-heading text-[10px] font-bold uppercase tracking-wide text-csnb-muted data-[state=active]:bg-csnb-orange data-[state=active]:text-white sm:text-xs"
              >
                Testimonials
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-1 rounded-sm font-heading text-[10px] font-bold uppercase tracking-wide text-csnb-muted data-[state=active]:bg-csnb-orange data-[state=active]:text-white sm:text-xs"
              >
                Comments
              </TabsTrigger>
            </TabsList>

            {/* Before & After */}
            <TabsContent value="before-after">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {beforeAfterData.map((item, i) => (
                  <div key={i} className="overflow-hidden rounded-sm border border-csnb-border bg-csnb-surface">
                    <div className="grid grid-cols-2 divide-x divide-csnb-border">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.before}
                          alt="Before"
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 rounded-sm bg-csnb-bg/85 px-2 py-1 font-heading text-xs text-csnb-muted">
                          TRƯỚC
                        </div>
                      </div>
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.after}
                          alt="After"
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 right-2 rounded-sm bg-csnb-orange px-2 py-1 font-heading text-xs font-bold text-white">
                          SAU
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-heading text-sm font-bold text-white">{item.name}</div>
                      <div className="mt-0.5 text-xs text-csnb-orange">{item.issue}</div>
                      <div className="mt-1 text-xs text-csnb-muted">⏱ {item.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Testimonials */}
            <TabsContent value="testimonials">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="rounded-sm border border-csnb-border bg-csnb-surface p-6">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} className="fill-csnb-orange-bright text-csnb-orange-bright" />
                      ))}
                    </div>
                    <p className="mb-5 text-sm italic leading-relaxed text-csnb-muted">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <div className="font-heading text-sm font-bold text-white">{t.name}</div>
                        <div className="text-xs text-csnb-muted">{t.role}</div>
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
                  <div key={n} className="relative aspect-[9/16] overflow-hidden rounded-sm border border-csnb-border">
                    <Image
                      src={`/images/fb${n}.png`}
                      alt={`Feedback ${n}`}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-10 text-center">
            <Link
              href="/results"
              className="inline-flex items-center gap-2 rounded-sm border border-csnb-border/70 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-csnb-muted transition-colors hover:border-csnb-orange hover:text-white"
            >
              Xem thêm kết quả <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ───────────────────────────── */}
      <section className="bg-csnb-panel py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-csnb-orange">
                Kiến thức nền tảng
              </span>
              <h2 className="mt-2 font-heading text-3xl font-black uppercase text-csnb-ink sm:text-4xl">
                Bài viết mới nhất
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden items-center gap-1 font-heading text-sm font-semibold uppercase tracking-wide text-csnb-orange transition-all hover:gap-2 sm:flex"
            >
              Tất cả bài viết <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, i) => (
              <Link
                key={i}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-sm bg-csnb-orange px-2 py-1 font-heading text-xs font-bold uppercase tracking-wide text-white">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 line-clamp-2 font-heading text-base font-bold leading-snug text-csnb-ink transition-colors group-hover:text-csnb-orange">
                    {post.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/blog" className="font-heading text-sm font-semibold uppercase tracking-wide text-csnb-orange">
              Xem tất cả bài viết →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────── */}
      <section id="pricing" className="relative overflow-hidden bg-csnb-bg py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=900&fit=crop&q=70"
            alt=""
            fill
            className="object-cover opacity-[0.18] blur-3xl saturate-[1.1]"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-csnb-bg via-csnb-bg/92 to-csnb-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_0%,rgba(28,92,104,0.35),transparent_65%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-csnb-orange">
              Đầu tư cho sức khỏe
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase text-white sm:text-4xl lg:text-5xl">
              Chọn gói phù hợp
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-sm border bg-csnb-surface p-6 ${
                  plan.popular
                    ? "border-csnb-orange shadow-lg shadow-csnb-orange/20"
                    : "border-csnb-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-csnb-orange px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wide text-white">
                    Được chọn nhiều nhất
                  </div>
                )}

                <div className="mb-4">
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-csnb-muted">
                    {plan.tag}
                  </span>
                  <h3 className="mt-1 font-heading text-lg font-black uppercase tracking-wide text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-csnb-muted">{plan.desc}</p>
                </div>

                <div className="mb-3 font-heading text-3xl font-black text-csnb-orange-bright">{plan.priceFrom}</div>

                <div className="mb-4 rounded-sm border border-csnb-border bg-csnb-bg p-3">
                  <div className="mb-2 font-heading text-[10px] font-bold uppercase tracking-wide text-csnb-muted">
                    Gói tập
                  </div>
                  <ul className="space-y-1.5">
                    {plan.tiers.map((tier, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 shrink-0 text-csnb-orange">›</span>
                        <span className="font-heading text-xs text-white">{tier}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-csnb-orange" />
                      <span className="text-xs text-csnb-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleOpenPricing(plan)}
                  className={`block w-full rounded-sm py-3 text-center font-heading text-sm font-bold uppercase tracking-wider transition-colors ${
                    plan.popular
                      ? "bg-csnb-orange text-white hover:bg-csnb-orange-deep"
                      : "border border-csnb-border/70 text-white hover:border-csnb-orange"
                  }`}
                >
                  Nhận QR thanh toán
                </button>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-sm border border-csnb-border bg-csnb-surface p-5 text-center">
            <div className="mb-2 font-heading text-[10px] font-bold uppercase tracking-widest text-csnb-muted">
              Lịch tập gợi ý
            </div>
            <p className="text-sm text-white/70">
              Người mới thường tập <strong className="text-white">3 buổi/tuần</strong>, mỗi buổi khoảng{" "}
              <strong className="text-white">60 phút</strong>. Online Coaching: linh hoạt theo lịch của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-csnb-border py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=1000&fit=crop&q=70"
            alt=""
            fill
            className="scale-105 object-cover opacity-[0.2] blur-3xl saturate-[1.05]"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-csnb-surface via-csnb-bg/94 to-csnb-surface" />
          <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_50%_-10%,rgba(255,159,67,0.1),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(11,52,60,0.5)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl lg:px-8">
          <div className="mb-14 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-csnb-orange/30 bg-csnb-orange/10 shadow-lg shadow-csnb-orange/10 backdrop-blur-sm">
              <HelpCircle className="text-csnb-orange-bright" size={28} strokeWidth={2} />
            </div>
            <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-csnb-orange">
              Câu hỏi thường gặp
            </span>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              Giải đáp{" "}
              <span className="bg-gradient-to-r from-csnb-orange-bright to-csnb-orange bg-clip-text text-transparent">
                thắc mắc
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-csnb-muted">
              Những điều học viên thường hỏi trước khi bắt đầu — bấm từng mục để xem chi tiết.
            </p>
          </div>

          <Accordion className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="not-last:border-b-0 overflow-hidden rounded-2xl border border-csnb-border/60 bg-csnb-bg/45 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 hover:border-csnb-orange/35 hover:bg-csnb-bg/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,159,67,0.08)]"
              >
                <AccordionTrigger className="items-center gap-4 px-5 py-5 text-left font-heading text-sm font-bold uppercase leading-snug tracking-wide text-white hover:no-underline [&_[data-slot=accordion-trigger-icon]]:shrink-0 [&_[data-slot=accordion-trigger-icon]]:text-csnb-orange-bright">
                  <span className="flex min-w-0 flex-1 items-start gap-4">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-csnb-border/80 bg-csnb-raised/80 font-heading text-[11px] font-black tabular-nums text-csnb-orange-bright">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 pt-0.5">{faq.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="border-t border-white/5 bg-gradient-to-b from-csnb-raised/30 to-transparent">
                  <div className="mx-5 mb-5 border-l-2 border-csnb-orange/45 py-1 pl-5 text-sm leading-relaxed text-csnb-muted">
                    {faq.a}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── PRICING DIALOG (QR) ────────────────────── */}
      <Dialog open={pricingDialog} onOpenChange={setPricingDialog}>
        <DialogContent className="max-w-sm border-csnb-border bg-csnb-surface text-white">
          <DialogHeader>
            <DialogTitle className="font-heading font-black uppercase tracking-wide text-white">
              Thanh toán: {selectedPlan?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-sm border border-csnb-border bg-csnb-bg p-4 text-center">
              <div className="mb-1 font-heading text-xs uppercase text-csnb-muted">Gói đã chọn</div>
              <div className="font-heading text-xl font-black text-csnb-orange-bright">{selectedPlan?.name}</div>
              <div className="mt-1 text-xs text-csnb-muted">
                Từ {selectedPlan?.priceFrom} · Liên hệ để chốt gói cụ thể
              </div>
            </div>

            <div className="mx-auto flex aspect-square max-w-[200px] items-center justify-center rounded-sm border border-csnb-border bg-csnb-bg p-4">
              <div className="text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-sm border-2 border-dashed border-csnb-border/70 bg-csnb-surface">
                  <div className="text-center text-xs text-csnb-muted">
                    QR Code
                    <br />
                    Ngân hàng
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-sm border border-csnb-border bg-csnb-bg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-csnb-muted">Ngân hàng:</span>
                <span className="font-semibold text-white">VCB / Vietcombank</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-csnb-muted">Số TK:</span>
                <span className="font-mono font-semibold text-white">1234567890</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-csnb-muted">Chủ TK:</span>
                <span className="font-semibold text-white">NGUYEN VAN A</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-csnb-muted">Nội dung CK:</span>
                <span className="font-mono text-xs text-csnb-orange-bright">
                  CSNB {selectedPlan?.id?.toUpperCase()} [SĐT]
                </span>
              </div>
            </div>

            <p className="text-center text-xs leading-relaxed text-csnb-muted">
              Sau khi chuyển khoản, admin sẽ xác nhận và mở khóa khóa học trong vòng{" "}
              <strong className="text-white">2–4 tiếng</strong>.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPricingDialog(false)}
                className="flex-1 rounded-sm border border-csnb-border/70 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-csnb-muted transition-colors hover:border-white/30 hover:text-white"
              >
                Đóng
              </button>
              <Link
                href="https://zalo.me"
                target="_blank"
                className="flex-1 rounded-sm bg-csnb-orange py-2.5 text-center font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
              >
                Liên hệ Zalo
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-csnb-orange text-white shadow-lg shadow-csnb-orange/30 transition-colors hover:bg-csnb-orange-deep"
        title="Chat Zalo"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
