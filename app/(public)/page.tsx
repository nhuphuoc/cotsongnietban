"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, fadeUpVariants, staggerContainer } from "@/components/marketing/reveal";
import { SITE_CONTACT } from "@/lib/site-contact";
import {
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  AlertTriangle,
  Zap,
  Shield,
  Clock,
  MessageCircle,
  HelpCircle,
  Activity,
  Route,
  HeartPulse,
  BookOpen,
  Fingerprint,
  Sprout,
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
  { number: "200+", label: "Hơn 200 học viên" },
  { number: "100%", label: "Có đánh giá tốt" },
  { number: "10", label: "Năm kinh nghiệm" },
  { number: "1:1", label: "Phương pháp cá nhân hóa" },
];

const targetAudience = [
  {
    icon: AlertTriangle,
    title: "Thoát vị & bệnh lý cột sống",
    desc: "Đã khám/chụp film trên 6 tháng, thể nhẹ, thoát vị dưới 7mm.",
  },
  {
    icon: Zap,
    title: "Đau lưng sinh hoạt",
    desc: "Cúi, ngồi, vận động… thể nhẹ; cần thì sẽ gợi ý chụp film.",
  },
  {
    icon: Clock,
    title: "Đau khớp mãn tính",
    desc: "Đau trên 3 tháng, điều trị chưa hết — cần lộ trình chức năng.",
  },
  {
    icon: Shield,
    title: "Phòng ngừa",
    desc: "Muốn khỏe cột sống và cơ–xương–khớp khi chưa đau.",
  },
];

/** Nội dung tập — 3 phase + 3 chu kỳ (copy chuẩn chương trình) */
const trainingPhases = [
  {
    step: "I",
    title: "Movement Restoration",
    text: "Giai đoạn này tập trung vào khôi phục lại các cơ tham gia vào các chuyển động khớp bị tổn thương, việc này sẽ giúp các khớp được giảm tải và cơ lấy lại vai trò vốn có là nâng đỡ và di động khớp.\n\nVị trí tác động là vùng LPHC (phức hợp hông – chậu – thắt lưng).",
  },
  {
    step: "II",
    title: "Accumulation",
    text: "Đây là giai đoạn tập trung vào muscles memory (trí nhớ cơ bắp), tăng dần số lượng tải thông qua tăng mật độ lặp lại giúp cho các cơ tăng sức bền và hạn chế được yếu tố điện cơ yếu và máu lưu thông kém.\n\nVị trí tác động là các vùng lân cận và bên ngoài cột sống như nhóm T-spine (đốt sống ngực).",
  },
  {
    step: "III",
    title: "Intensification",
    text: "Giai đoạn tác động vào thẳng đốt sống thắt lưng với các chuyển động gập, duỗi và uốn cong đốt sống, đây là giai đoạn đòi hỏi cơ thể đã có nền tảng chuyển động từ 2 giai đoạn trước.\n\nTập trung vào lượng tải, khả năng tải, quãng đường di động khớp và sự phối hợp của toàn thân.",
  },
] as const;

const trainingCycles = [
  {
    name: "Mobilization",
    desc: "Khả năng cơ co và duỗi, khả năng khớp di động, ngưỡng kháng cự và khả năng cho phép khớp di chuyển để đạt tính hiệu quả.",
  },
  {
    name: "Activation",
    desc: "Khả năng cơ giữ tĩnh để ổn định tư thế, cơ thể bắt đầu học cách huy động contraction (sức căng cơ) để tham gia vào chuyển động.",
  },
  {
    name: "Integration",
    desc: "Những bài tập đòi hỏi mức độ phối hợp các khớp để thực hiện các chuyển động phức tạp hơn, đây là khối khó nhất, và khi cơ thể bạn thực hiện được các bài tập ở khối này thì tất cả các cơ sẽ lấy lại chức năng vốn có của chúng và cột sống của bạn luôn được bảo vệ.",
  },
] as const;

const trainingProgressNote =
  "Sau mỗi chu kỳ lặp lại bạn sẽ được tiếp cận các bài tập khó hơn, nặng hơn để cho cơ thể thích nghi liên tục về di động khớp cũng như lượng tải. Qua mỗi lần như thế, cơ thể của bạn được đào tạo mạnh mẽ và bền bỉ hơn, chống chọi đến các tác nhân bên trong dẫn đến các bệnh về cột sống hay viêm khớp.";

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
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
    text: "Đau lưng mãn tính giảm rõ sau 3 tháng; ngồi làm việc cả ngày đỡ mỏi hơn nhiều.",
    rating: 5,
  },
  {
    name: "Anh Minh Tuấn",
    role: "Vận động viên, 28 tuổi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    text: "Thoát vị L5-S1 từng phải nghỉ tập — giờ tập lại ổn và an tâm hơn về lưng.",
    rating: 5,
  },
  {
    name: "Chị Thu Hương",
    role: "Giáo viên, 42 tuổi",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    text: "Đứng lớp cả ngày đỡ đau chân; giảm dần thuốc giảm đau sau vài tuần.",
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
    name: "Tập luyện trực tiếp",
    tag: "TRỰC TIẾP",
    priceFrom: "17TR+",
    tiers: [
      "30 BUỔI — 17.000.000đ (3 tháng)",
      "60 BUỔI — 31.000.000đ (6 tháng)",
      "100 BUỔI — 45.000.000đ (10 tháng)",
    ],
    desc: "Coach kinh nghiệm cột sống & đau khớp mãn tính; theo sát 1-1.",
    features: [
      "Có buổi giải cơ trị liệu kèm theo",
      "Ưu tiên xử lý khẩn cấp và chỉnh lộ trình kịp thời",
      "Chi phí trọn gói theo thời gian (không chỉ tính buổi): cố vấn, tập, hỗ trợ khi có sự cố ở nhà/công ty",
    ],
    popular: false,
  },
  {
    id: "zoom",
    name: "Trực tuyến trực tiếp (Zoom)",
    tag: "ZOOM",
    priceFrom: "14TR+",
    tiers: [
      "30 BUỔI — 14.000.000đ",
      "60 BUỔI — 26.000.000đ",
      "100 BUỔI — 38.000.000đ",
    ],
    desc: "Ở xa vẫn được coach hướng dẫn trực tiếp qua Zoom.",
    features: [
      "Chương trình theo tình trạng từng ngày của học viên",
      "Giải đáp thắc mắc & thông tin bệnh lý trực tiếp",
      "Học viên tập ngoài phòng hoặc tự chuẩn bị dụng cụ thuận tiện",
    ],
    popular: true,
  },
  {
    id: "online",
    name: "Online Coaching (gián tiếp)",
    tag: "ONLINE",
    priceFrom: "Liên hệ",
    tiers: [
      "Đăng ký qua Google Form (thông tin liên hệ)",
      "Lộ trình cá nhân hóa theo từng người, từng tình trạng",
      "Theo sát & hướng dẫn cụ thể trong suốt quá trình",
    ],
    desc: "Theo sát online, lộ trình rõ — không phải tự mò phương pháp.",
    features: [
      "Kết hợp kỹ thuật thể dục, trị liệu phục hồi & giáo dục tư thế",
      "Sau khi đặt câu hỏi triệu chứng, sẽ gợi ý có nên chụp film khi cần",
      "Ưu tiên kiến thức bệnh lý & tổ chức lối sống lành mạnh lâu dài",
    ],
    popular: false,
    registrationUrl: SITE_CONTACT.onlineCoachingFormUrl,
  },
];

const faqs = [
  {
    q: "Đối tượng đăng ký Online Coaching là ai?",
    a: "Thoát vị/bệnh lý cột sống (đã film trên 6 tháng, thể nhẹ, dưới 7mm). Đau lưng sinh hoạt thể nhẹ — trao đổi triệu chứng rồi gợi ý film nếu cần. Đau khớp trên 3 tháng chưa hết. Người muốn khỏe cột sống và cơ–xương–khớp dù chưa đau.",
  },
  {
    q: "Một tuần tập bao nhiêu buổi và một buổi kéo dài bao lâu?",
    a: "Với những người mới bắt đầu, thông thường sẽ tập 3 buổi/tuần. Mỗi buổi kéo dài khoảng 60 phút.",
  },
  {
    q: "Có cần tập cùng một khung thời gian cố định không?",
    a: "VỚI ONLINE COACHING:\n\nNếu học viên tạo được một khung thời gian cố định thì quá tốt, như thế đồng hồ sinh học sẽ được thiết lập để phục vụ việc tập luyện tối ưu nhất, ngoài ra đừng để bất cứ yếu tố nào khác gây sao nhãng hoặc kéo dài buổi tập không cần thiết như gọi/ nhắn tin công việc, lướt điện thoại, làm việc khác...\n\nTrường hợp học viên không tạo được khung thời gian cố định cũng không sao, miễn thỏa điều kiện tập trung 100% tinh thần và tập trung vào buổi tập thì rất tốt rồi.\n\nVỚI TRỰC TIẾP VÀ FACETIME COACHING:\n\nSẽ có sự thảo luận giữa coach và học viên để đưa ra giờ tập hợp lý.\n\nNếu có sự thay đổi nào từ học viên nên có thông báo trước (2 - 7 ngày) để coach có thể sắp xếp cho học viên tập được trong cùng tuần đó tránh việc ngắt quãng làm chậm tiến trình.",
  },
  {
    q: "Tập bao lâu thì sẽ thấy rõ hiệu quả?",
    a: "Tuần đầu thường thấy nhẹ hơn. Giảm đau rõ hơn khoảng từ tuần 5 (case nặng có thể tuần 8). Giai đoạn đầu có thể mệt vì cơ “ngủ lâu” — là bình thường. Đây là đầu tư lâu dài, không phải giảm đau kiểu thuốc; cần kiên trì.",
  },
  {
    q: "Chương trình tập này có phát triển cơ không?",
    a: "Phát triển cơ là điều ưu tiên hàng đầu trong chương trình tập luyện này.\n\nKhác với khái niệm phì đại cơ — hypertrophy mọi người thường thấy những vận động viên với khối cơ khổng lồ. Tập luyện chức năng sẽ phát những nhóm cơ bên trong, cơ bám xương — LOCAL MUSCLES. Khi những cơ này khỏe mạnh, cơ thể mọi người sẽ được thiết lập lại cấu trúc vững vàng hơn và giảm đau. Bạn thử nghĩ khi bạn đã cho các cơ này tải khối lượng lớn thì việc chống đỡ khối lượng của khung xương thì đâu phải chuyện gì lớn.\n\nNgoài ra, tập luyện chức năng còn giúp hệ gân — dây chằng khỏe mạnh, đàn hồi, giúp cơ thể dẻo dai tự do di chuyển mà không cần phải lo lắng né tránh các cử động gây đau.",
  },
  {
    q: "Chương trình tập này có giảm mỡ không?",
    a: "Tùy mức độ. Giảm mỡ căn bản cần một hệ trao đổi chất tốt và thuận lợi diễn ra thâm hụt calories.\n\nTrong chương trình hướng dẫn ăn uống của Cột Sống Niết Bàn có gợi ý về cách ăn uống hỗ trợ cho việc ăn không tạo ra calories dư thừa.\n\nTuy nhiên nếu bạn là người thể chất kém và nhiều bệnh nền như đường huyết cao, men gan cao, mỡ máu, gan nhiễm mỡ,... và bệnh lý về thể lý nặng như thoát vị, quá lâu không vận động, lớn tuổi thì việc giảm mỡ sẽ diễn ra chậm hơn do giới hạn số bài tập tiếp cận ở thời gian đầu. Song khi cơ thể bạn khỏe mạnh hơn từng giai đoạn, chương trình tập được nâng cấp hơn và cơ thể bạn khỏe mạnh lên thì quá trình giảm mỡ diễn ra suôn sẻ hơn. => Cơ thể khỏe mạnh sẽ tạo ra một cơ thể đẹp.",
  },
  {
    q: "Tôi cần dụng cụ gì không?",
    a: "Tại nhà: thường tối thiểu, coach sẽ gợi ý thay thế. Trực tiếp: phòng có sẵn dụng cụ.",
  },
  {
    q: "Chi phí trực tiếp có phải chỉ tính theo số buổi không?",
    a: "Không. Đó là chi phí trọn gói cho toàn bộ thời gian trị liệu, gồm cố vấn sức khỏe, tập luyện và ưu tiên xử lý khi có vấn đề bất ngờ ở nhà/nơi làm việc…",
  },
  {
    q: "Đăng ký Online Coaching ở đâu?",
    a: "Vui lòng điền form Google trong mục bảng giá (nút Đăng ký qua form) hoặc nhắn Zalo để được hỗ trợ.",
  },
];

const benefitPillars = [
  {
    Icon: Activity,
    text: "Khắc phục triệt để các tình trạng cột sống, đau khớp hay các bệnh lý vật lý khác.",
  },
  {
    Icon: Route,
    text: "Được hướng dẫn cụ thể trong suốt quá trình mà bạn không cần phải lo ngại về việc phải đi tìm phương pháp khác nữa.",
  },
  {
    Icon: HeartPulse,
    text: "Phương pháp tập luyện không dùng thuốc, không tác dụng phụ và mang tính đầu tư sức khỏe về lâu dài.",
  },
  {
    Icon: BookOpen,
    text: "Cung cấp các kiến thức về tình trạng bệnh lý bạn đang mắc phải, sau khi tập luyện với chúng tôi, bạn sẽ không bị đau trở lại nữa.",
  },
  {
    Icon: Fingerprint,
    text: "Chương trình tập là CÁ NHÂN HÓA, phù hợp với từng người với từng tình trạng khác nhau.",
  },
  {
    Icon: Sprout,
    text: "Được cung cấp các kiến thức về tổ chức lối sống lành mạnh, vì các triệu chứng bạn mắc phải có thể là xuất phát từ nhiều bệnh lý tiềm ẩn trong cơ thể bạn do lối sống và sinh hoạt thiếu điều độ.",
  },
] as const;

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
          <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-[0.85]" />
          <div className="csnb-ambient-grid absolute inset-0" />
          <div className="csnb-ambient-noise absolute inset-0" />
        </div>
        <div className="pointer-events-none absolute -right-24 top-20 z-[1] h-80 w-80 rounded-full bg-csnb-orange/20 blur-3xl lg:right-10" />
        <div className="pointer-events-none absolute -left-20 bottom-10 z-[1] h-64 w-64 rounded-full bg-csnb-orange/15 blur-3xl" />
        <div className="csnb-drift-orb csnb-drift-orb--warm z-[1]" aria-hidden />
        <div className="csnb-drift-orb csnb-drift-orb--cool z-[1]" aria-hidden />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 sm:pb-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <motion.div
            className="text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUpVariants}
              className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-csnb-orange sm:text-xs sm:tracking-[0.2em]"
            >
              Tin vui — thoát vị có thể được quản lý tốt hơn
            </motion.p>
            <motion.h1
              variants={fadeUpVariants}
              className="text-balance font-sans text-[1.65rem] font-extrabold leading-snug tracking-normal text-white sm:text-4xl sm:leading-tight lg:text-[2.65rem] lg:leading-[1.15]"
            >
              Cột Sống Niết Bàn —{" "}
              <span className="relative inline-block text-csnb-orange-bright">
                <span className="relative z-10">khôi phục &amp; phát triển cột sống toàn diện</span>
                <span
                  className="csnb-animate-highlight-bar absolute -bottom-0.5 left-0 right-0 z-0 h-2.5 rounded-sm bg-csnb-orange/35 sm:h-3"
                  aria-hidden
                />
              </span>
            </motion.h1>

            <motion.div variants={fadeUpVariants} className="mx-auto mt-7 max-w-xl lg:mx-0">
              <p className="text-pretty font-sans text-base font-semibold leading-relaxed text-white sm:text-lg">
                Hãy tập trung vào chính bạn — sức khỏe là quan trọng nhất.
              </p>
              <p className="mt-4 text-pretty font-sans text-[0.9375rem] leading-[1.65] tracking-[0.01em] text-csnb-muted sm:text-base sm:leading-[1.7]">
                Chương trình chăm sóc cột sống: thể dục, trị liệu phục hồi và giáo dục tư thế — giúp giảm đau, ổn
                định vùng hông–chậu–lưng và vận động an toàn hơn.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/#pricing"
                className="group inline-flex min-h-11 items-center justify-center gap-3 rounded-md bg-csnb-orange px-7 py-3 font-sans text-sm font-semibold text-white shadow-lg shadow-csnb-orange/30 transition-all duration-200 hover:scale-[1.02] hover:bg-csnb-orange-deep active:scale-[0.99]"
              >
                Bảng giá &amp; gói tập
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </Link>
              <Link
                href="/results"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/25 bg-transparent px-6 py-3 font-sans text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:border-white/50 hover:bg-white/5 active:scale-[0.99]"
              >
                <Play size={16} className="text-csnb-orange" />
                Xem kết quả
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              className="mt-14 hidden flex-col items-center gap-2 text-csnb-muted sm:flex lg:hidden"
            >
              <span className="font-heading text-xs uppercase tracking-widest text-csnb-muted/90">
                Cuộn để khám phá
              </span>
              <ChevronDown size={20} className="csnb-animate-bob" strokeWidth={2.25} />
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=1125&fit=crop"
                alt="Học viên tập luyện an toàn"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 90vw, 45vw"
                priority
              />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-lg border border-csnb-border bg-csnb-surface/95 p-5 text-white shadow-xl backdrop-blur-sm sm:left-6 sm:right-auto sm:max-w-sm">
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-white">
                Bắt đầu hôm nay
              </p>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-csnb-muted">
                Coach đồng hành theo tình trạng của bạn.
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
                <p className="font-sans text-xs leading-snug text-csnb-muted">Học viên đồng hành cùng chúng tôi.</p>
              </div>
              <Link
                href="/#pricing"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-csnb-orange py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-csnb-orange-deep"
              >
                Bảng giá &amp; gói tập
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BANNER ───────────────────────────── */}
      <section className="relative overflow-hidden border-y border-csnb-border bg-csnb-surface">
        <div className="csnb-ambient-mesh-surface pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="csnb-ambient-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="csnb-ambient-noise pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4 md:gap-6 lg:gap-0 lg:divide-x lg:divide-csnb-border">
            {trustStats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center lg:px-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.07, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="font-sans text-2xl font-extrabold tabular-nums tracking-normal text-csnb-orange-bright sm:text-3xl lg:text-[1.85rem] xl:text-3xl">
                  {stat.number}
                </div>
                <div className="mx-auto mt-2 max-w-[14rem] font-sans text-[11px] font-medium uppercase leading-snug tracking-wide text-csnb-muted sm:text-xs">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NỘI DUNG TẬP: phase + chu kỳ (gộp một section) ─ */}
      <section
        id="noi-dung-tap"
        className="relative scroll-mt-24 overflow-hidden bg-csnb-bg py-20 lg:py-28"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&h=900&fit=crop&q=70"
            alt=""
            fill
            className="object-cover opacity-[0.22] blur-3xl saturate-[1.08]"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-csnb-bg via-csnb-bg/88 to-csnb-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_50%,rgba(28,92,104,0.25),transparent_55%)]" />
          <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-60" />
          <div className="csnb-ambient-grid absolute inset-0 opacity-80" />
          <div className="csnb-ambient-noise absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16" y={28}>
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
                Nội dung tập luyện
              </span>
              <h2 className="mt-3 font-sans text-2xl font-extrabold leading-snug tracking-normal text-white sm:text-3xl lg:text-4xl">
                Phục hồi chức năng{" "}
                <span className="text-csnb-orange-bright">cơ – xương – khớp</span>
              </h2>
              <p className="mt-5 max-w-xl font-sans text-[0.9375rem] leading-[1.65] text-csnb-muted sm:text-base sm:leading-[1.7]">
                Chương trình tập luyện phục hồi chức năng cơ – xương – khớp của Cột Sống Niết Bàn được chia làm{" "}
                <strong className="text-white/95">3 phase</strong>. Mỗi phase có{" "}
                <strong className="text-white/95">3 chu kỳ</strong> được luân phiên xen kẽ:{" "}
                <span className="text-csnb-orange-bright">Mobilization</span>,{" "}
                <span className="text-csnb-orange-bright">Activation</span>,{" "}
                <span className="text-csnb-orange-bright">Integration</span> — tăng dần độ khó để khớp và tải thích
                nghi, hướng tới cơ thể bền hơn trước đau cột sống và khớp.
              </p>
              <Link
                href="/#pricing"
                className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-csnb-orange px-6 py-3 font-sans text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-csnb-orange-deep active:scale-[0.99]"
              >
                Bảng giá &amp; gói tập
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <div className="relative aspect-[5/4] overflow-hidden rounded-sm shadow-xl ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=720&fit=crop"
                  alt="Tập luyện cùng coach"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1023px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-4 right-4 max-w-[260px] rounded-sm border border-csnb-border bg-csnb-surface p-4 shadow-lg sm:right-6">
                <p className="font-sans text-xl font-extrabold leading-tight text-csnb-orange-bright sm:text-2xl">
                  Tuần 1 · Tuần 5+
                </p>
                <p className="mt-1 font-sans text-xs leading-relaxed text-csnb-muted">
                  Nhẹ hơn sau tuần đầu; giảm đau rõ hơn quanh tuần 5 (nặng có thể tuần 8).
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-16 lg:mt-20" y={22}>
            <div className="mb-6 flex flex-col gap-2 border-b border-csnb-border/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <h3 className="font-sans text-lg font-bold text-white sm:text-xl">
                Ba phase — chi tiết lộ trình
              </h3>
              <p className="max-w-md font-sans text-xs leading-relaxed text-csnb-muted">
                Nhấn từng mục để đọc đầy đủ nội dung chương trình (I → II → III).
              </p>
            </div>
            <Accordion
              defaultValue={[]}
              multiple
              className="flex flex-col gap-3 sm:gap-4"
            >
              {trainingPhases.map((phase) => (
                <AccordionItem
                  key={phase.step}
                  value={`phase-${phase.step}`}
                  className="overflow-hidden rounded-xl border border-csnb-border bg-csnb-surface/95 shadow-sm ring-1 ring-white/5 not-last:border-b-0 [&:has(button[aria-expanded='true'])]:border-csnb-orange/40"
                >
                  <AccordionTrigger className="items-center gap-3 px-4 py-4 hover:no-underline sm:px-5 sm:py-[1.125rem] [&_[data-slot=accordion-trigger-icon]]:shrink-0 [&_[data-slot=accordion-trigger-icon]]:text-csnb-orange-bright">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className="font-sans text-2xl font-black leading-none text-csnb-orange/40"
                        aria-hidden
                      >
                        {phase.step}
                      </span>
                      <span className="min-w-0 font-sans text-sm font-bold uppercase tracking-wide text-white sm:text-[0.8125rem]">
                        {phase.title}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-csnb-border/60 bg-csnb-bg/40">
                    <p className="whitespace-pre-line px-4 pb-4 pt-3 font-sans text-[13px] leading-relaxed text-csnb-muted sm:px-5 sm:pb-5 sm:text-sm sm:leading-relaxed">
                      {phase.text}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal className="mt-12" y={18}>
            <div className="rounded-2xl border border-csnb-orange/25 bg-csnb-surface/70 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-8">
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
                Trong mỗi phase
              </p>
              <h3 className="mt-2 font-sans text-lg font-bold text-white sm:text-xl">
                Ba chu kỳ luân phiên xen kẽ
              </h3>
              <p className="mt-3 max-w-2xl font-sans text-[13px] leading-relaxed text-csnb-muted sm:text-sm">
                <span className="font-medium text-csnb-orange-bright">Mobilization</span>
                {" · "}
                <span className="font-medium text-csnb-orange-bright">Activation</span>
                {" · "}
                <span className="font-medium text-csnb-orange-bright">Integration</span>
                {" "}
                — mỗi phase lặp ba chu kỳ; mở rộng bên dưới để đọc định nghĩa đầy đủ và tiến trình tăng tải.
              </p>

              <Accordion defaultValue={[]} className="mt-5">
                <AccordionItem
                  value="cycles-detail"
                  className="not-last:border-b-0 overflow-hidden rounded-xl border border-csnb-border bg-csnb-bg/50"
                >
                  <AccordionTrigger className="items-center px-4 py-3.5 hover:no-underline sm:px-5 sm:py-4 [&_[data-slot=accordion-trigger-icon]]:text-csnb-orange-bright">
                    <span className="font-sans text-sm font-semibold text-white">
                      Đọc chi tiết ba chu kỳ &amp; lộ trình tập
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="border-t border-csnb-border/60 px-4 pb-5 pt-4 sm:px-5">
                      <div className="grid gap-5 md:grid-cols-3">
                        {trainingCycles.map((c) => (
                          <div
                            key={c.name}
                            className="rounded-xl border border-csnb-border bg-csnb-bg/80 p-4 sm:p-5"
                          >
                            <h4 className="font-sans text-sm font-bold uppercase tracking-wide text-csnb-orange-bright">
                              {c.name}
                            </h4>
                            <p className="mt-2 font-sans text-[13px] leading-relaxed text-csnb-muted sm:text-sm">
                              {c.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-6 border-t border-csnb-border/80 pt-6 font-sans text-[13px] leading-relaxed text-csnb-muted sm:text-sm">
                        {trainingProgressNote}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA STRIP ──────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-csnb-border bg-csnb-orange py-12 text-white lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_0%_50%,rgba(255,255,255,0.12),transparent_50%),radial-gradient(ellipse_60%_100%_at_100%_0%,rgba(232,112,16,0.35),transparent_45%)]"
          aria-hidden
        />
        <div className="csnb-cta-shine pointer-events-none absolute inset-0" aria-hidden />
        <div className="csnb-ambient-noise pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" aria-hidden />
        <motion.div
          className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <h3 className="font-sans text-xl font-extrabold leading-snug tracking-normal text-white sm:text-2xl">
              Trở thành học viên Cột Sống Niết Bàn
            </h3>
            <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-white/85">
              Xem bảng giá hoặc nhắn Zalo — team tư vấn theo tình trạng của bạn.
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
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-white/30 bg-csnb-bg px-6 py-3 font-heading text-xs font-black uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:scale-[1.03] hover:bg-csnb-raised active:scale-[0.98]"
            >
              Liên hệ ngay
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── LỢI ÍCH ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-csnb-panel via-white to-[#e8f4f6] py-20 text-csnb-ink lg:py-28">
        <div className="csnb-panel-depth pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="csnb-panel-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-csnb-orange/[0.11] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-csnb-border/[0.12] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,159,67,0.08),transparent_55%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center" y={22}>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-csnb-orange">
              Lợi ích
            </span>
            <h2 className="mt-4 font-sans text-2xl font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-3xl lg:text-[2rem] lg:leading-tight">
              Lợi ích khi tập luyện với{" "}
              <span className="bg-gradient-to-r from-csnb-orange-deep via-csnb-orange to-csnb-orange-bright bg-clip-text text-transparent">
                Cột Sống Niết Bàn
              </span>
            </h2>
            <div
              className="mx-auto mt-5 h-1 w-14 rounded-full bg-gradient-to-r from-csnb-orange to-csnb-border/40"
              aria-hidden
            />
            <p className="mx-auto mt-5 max-w-2xl font-sans text-sm leading-relaxed text-neutral-600">
              Sáu trụ cột đồng hành cùng bạn — từ giảm đau, hiểu bệnh lý đến lối sống bền vững.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {benefitPillars.map((item, i) => {
              const Icon = item.Icon;
              return (
                <motion.article
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 p-6 shadow-[0_4px_28px_-10px_rgba(6,38,44,0.1)] backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-0.5 hover:border-csnb-orange/30 hover:shadow-[0_14px_40px_-12px_rgba(255,159,67,0.14)] sm:p-7"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-24px" }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-csnb-orange-deep via-csnb-orange to-csnb-orange-bright transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-csnb-orange/14 via-white to-csnb-panel shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-csnb-border/35">
                      <Icon className="text-csnb-orange" size={26} strokeWidth={2} aria-hidden />
                    </div>
                    <p className="min-w-0 text-pretty font-sans text-[0.9375rem] font-medium leading-[1.65] text-neutral-800 sm:text-base sm:leading-[1.7]">
                      {item.text}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <Reveal
            className="mt-12 flex flex-col items-stretch justify-between gap-5 rounded-2xl border border-csnb-orange/20 bg-gradient-to-br from-white via-csnb-panel/40 to-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:px-8"
            delay={0.1}
            y={18}
          >
            <p className="max-w-xl text-pretty text-center font-sans text-sm leading-relaxed text-neutral-700 sm:text-left">
              Sẵn sàng bắt đầu với lộ trình phù hợp tình trạng của bạn — xem gói tập hoặc nhắn team để được tư
              vấn.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
              <Link
                href="/#pricing"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-csnb-orange px-6 font-sans text-sm font-semibold text-white shadow-md shadow-csnb-orange/20 transition hover:bg-csnb-orange-deep"
              >
                Bảng giá &amp; gói tập
              </Link>
              <Link
                href={SITE_CONTACT.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-csnb-border/60 bg-white px-6 font-sans text-sm font-semibold text-csnb-ink transition hover:border-csnb-orange/40 hover:bg-csnb-panel/50"
              >
                Liên hệ Zalo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-csnb-bg py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-70" />
          <div className="csnb-ambient-grid absolute inset-0 opacity-50" />
          <div className="csnb-ambient-noise absolute inset-0" />
          <div className="csnb-drift-orb csnb-drift-orb--cool opacity-55" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-14 text-center" y={22}>
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
              Đối tượng phù hợp
            </span>
            <h2 className="mt-3 font-sans text-2xl font-extrabold leading-snug tracking-normal text-white sm:text-3xl lg:text-4xl">
              Ai nên đăng ký{" "}
              <span className="text-csnb-orange-bright">Online Coaching?</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {targetAudience.map((p, i) => (
              <motion.div
                key={i}
                className="group rounded-sm border border-csnb-border bg-csnb-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-csnb-orange/40 hover:shadow-md hover:shadow-csnb-orange/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-24px" }}
                transition={{ delay: i * 0.06, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-csnb-orange/10 transition-colors group-hover:bg-csnb-orange/20">
                  <p.icon size={20} className="text-csnb-orange" />
                </div>
                <h3 className="mb-2 font-sans text-base font-semibold leading-snug tracking-normal text-white">
                  {p.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-csnb-muted">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-csnb-bg py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=65"
            alt=""
            fill
            className="object-cover opacity-[0.14] blur-3xl"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-csnb-bg via-csnb-bg/92 to-csnb-bg" />
          <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-55" />
          <div className="csnb-ambient-grid absolute inset-0 opacity-45" />
          <div className="csnb-ambient-noise absolute inset-0" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center" y={20}>
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
              Một số feedbacks
            </span>
            <h2 className="mt-3 font-sans text-2xl font-extrabold leading-snug tracking-normal text-white sm:text-3xl lg:text-4xl">
              Kết quả &amp; phản hồi học viên
            </h2>
          </Reveal>

          <Tabs defaultValue="before-after" className="w-full">
            <TabsList className="mx-auto mb-8 flex w-full max-w-md rounded-sm border border-csnb-border bg-csnb-surface p-1">
              <TabsTrigger
                value="before-after"
                className="flex-1 rounded-sm font-sans text-[10px] font-semibold uppercase tracking-wide text-csnb-muted data-[state=active]:bg-csnb-orange data-[state=active]:text-white sm:text-xs"
              >
                Before & After
              </TabsTrigger>
              <TabsTrigger
                value="testimonials"
                className="flex-1 rounded-sm font-sans text-[10px] font-semibold uppercase tracking-wide text-csnb-muted data-[state=active]:bg-csnb-orange data-[state=active]:text-white sm:text-xs"
              >
                Phản hồi
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-1 rounded-sm font-sans text-[10px] font-semibold uppercase tracking-wide text-csnb-muted data-[state=active]:bg-csnb-orange data-[state=active]:text-white sm:text-xs"
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
                    <p className="mb-5 font-sans text-sm not-italic leading-relaxed text-csnb-muted">
                      &ldquo;{t.text}&rdquo;
                    </p>
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
      <section className="relative overflow-hidden bg-csnb-panel py-20 lg:py-28">
        <div className="csnb-panel-depth pointer-events-none absolute inset-0 opacity-90" aria-hidden />
        <div className="csnb-panel-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 flex items-end justify-between" y={18}>
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
                Kiến thức nền tảng
              </span>
              <h2 className="mt-2 font-sans text-2xl font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-3xl">
                Bài viết mới nhất
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden items-center gap-1 font-sans text-sm font-semibold text-csnb-orange transition-all hover:gap-2 sm:flex"
            >
              Tất cả bài viết <ArrowRight size={16} />
            </Link>
          </Reveal>

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
      <section id="pricing" className="relative scroll-mt-24 overflow-hidden bg-csnb-bg py-20 lg:py-28">
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
          <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-75" />
          <div className="csnb-ambient-grid absolute inset-0" />
          <div className="csnb-ambient-noise absolute inset-0" />
          <div className="csnb-drift-orb csnb-drift-orb--warm z-[1] opacity-45" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-14 text-center" y={18}>
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
              Đầu tư cho sức khỏe
            </span>
            <h2 className="mt-3 font-sans text-2xl font-extrabold leading-snug tracking-normal text-white sm:text-3xl lg:text-4xl">
              Các hình thức tập luyện
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty font-sans text-sm leading-relaxed text-csnb-muted">
              Trực tiếp tại phòng · Online Coaching · Zoom — chọn theo lịch và khoảng cách của bạn.
            </p>
          </Reveal>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                className={`relative flex flex-col rounded-sm border bg-csnb-surface p-6 transition-transform duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-csnb-orange shadow-lg shadow-csnb-orange/20"
                    : "border-csnb-border"
                }`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
                  <h3 className="mt-1 font-sans text-lg font-bold leading-snug tracking-normal text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 font-sans text-xs leading-relaxed text-csnb-muted">{plan.desc}</p>
                </div>

                <div className="mb-3 font-sans text-3xl font-extrabold tabular-nums text-csnb-orange-bright">
                  {plan.priceFrom}
                </div>

                <div className="mb-4 rounded-sm border border-csnb-border bg-csnb-bg p-3">
                  <div className="mb-2 font-heading text-[10px] font-bold uppercase tracking-wide text-csnb-muted">
                    Gói tập
                  </div>
                  <ul className="space-y-1.5">
                    {plan.tiers.map((tier, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 shrink-0 text-csnb-orange">›</span>
                        <span className="font-sans text-xs leading-snug text-white">{tier}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-csnb-orange" />
                      <span className="font-sans text-xs leading-relaxed text-csnb-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                {"registrationUrl" in plan && plan.registrationUrl ? (
                  <Link
                    href={plan.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex min-h-11 w-full items-center justify-center rounded-md px-3 py-3 text-center font-sans text-sm font-semibold transition-colors ${
                      plan.popular
                        ? "bg-csnb-orange text-white hover:bg-csnb-orange-deep"
                        : "border border-csnb-border/70 text-white hover:border-csnb-orange"
                    }`}
                  >
                    Đăng ký qua form
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPricing(plan)}
                    className={`flex min-h-11 w-full items-center justify-center rounded-md px-3 py-3 text-center font-sans text-sm font-semibold transition-colors ${
                      plan.popular
                        ? "bg-csnb-orange text-white hover:bg-csnb-orange-deep"
                        : "border border-csnb-border/70 text-white hover:border-csnb-orange"
                    }`}
                  >
                    Thanh toán ngay
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <Reveal className="mx-auto mt-8 max-w-2xl rounded-sm border border-csnb-border bg-csnb-surface p-5 text-center" y={14} delay={0.08}>
            <div className="mb-2 font-heading text-[10px] font-bold uppercase tracking-widest text-csnb-muted">
              Lịch tập gợi ý
            </div>
            <p className="font-sans text-sm leading-relaxed text-white/70">
              Gợi ý: <strong className="text-white">3 buổi/tuần</strong>, mỗi buổi ~{" "}
              <strong className="text-white">60 phút</strong>. Online: cố định giờ nếu được; không thì cứ tập
              trung 100%. Trực tiếp &amp; Zoom: báo đổi lịch trước 2–7 ngày.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────── */}
      <section
        id="faq"
        className="relative scroll-mt-24 overflow-hidden border-y border-csnb-border/25 py-20 lg:py-28"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-[#eef8f9] to-csnb-panel"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-csnb-orange/[0.09] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-csnb-border/[0.14] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(255,159,67,0.06),transparent_58%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.45]" aria-hidden>
          <div className="csnb-panel-grid absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-0">
            {/* Intro — Montserrat for readability (Anton is too condensed for long Vietnamese) */}
            <Reveal className="text-center lg:col-span-5 lg:max-w-md lg:justify-self-start lg:text-left" y={20}>
              <div className="flex flex-col lg:sticky lg:top-28">
                <motion.div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-csnb-orange/20 bg-gradient-to-br from-white to-csnb-panel shadow-md shadow-csnb-orange/10 ring-1 ring-csnb-border/20 lg:mx-0"
                  initial={{ scale: 0.92, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  <HelpCircle className="text-csnb-orange" size={26} strokeWidth={2} />
                </motion.div>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-csnb-orange">
                  Câu hỏi thường gặp
                </span>
                <h2 className="mt-3 text-balance font-sans text-[1.65rem] font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-3xl sm:leading-tight">
                  Giải đáp{" "}
                  <span className="bg-gradient-to-r from-csnb-orange-deep via-csnb-orange to-csnb-orange-bright bg-clip-text text-transparent">
                    thắc mắc
                  </span>
                </h2>
                <div
                  className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-csnb-orange via-csnb-orange-bright to-csnb-border/50 lg:mx-0"
                  aria-hidden
                />
                <p className="mx-auto mt-4 max-w-sm text-pretty font-sans text-sm leading-relaxed text-neutral-600 lg:mx-0 lg:max-w-none">
                  Những điều học viên hay hỏi trước khi bắt đầu. Mở từng mục để xem chi tiết — nếu chưa đủ, nhắn team
                  để được giải đáp thêm.
                </p>

                <ul className="mx-auto mt-7 flex max-w-md flex-col gap-2 text-left sm:max-w-lg lg:mx-0">
                  {[
                    { t: "Gợi ý lịch", d: "3 buổi/tuần · ~60 phút/buổi" },
                    { t: "Hình thức", d: "Trực tiếp · Online · Zoom" },
                    { t: "Lộ trình", d: "Cá nhân hóa theo tình trạng" },
                  ].map((row) => (
                    <li
                      key={row.t}
                      className="flex items-start gap-3 rounded-xl border border-csnb-border/20 bg-white/80 px-3.5 py-2.5 shadow-sm backdrop-blur-sm"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-csnb-panel">
                        <CheckCircle2 className="text-csnb-orange" size={15} strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-sans text-sm font-semibold leading-snug tracking-normal text-csnb-ink">
                          {row.t}
                        </span>
                        <span className="mt-0.5 block font-sans text-xs leading-relaxed text-neutral-600">{row.d}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={SITE_CONTACT.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-auto mt-7 inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-full border border-csnb-border/40 bg-csnb-ink px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-csnb-raised hover:shadow-lg lg:mx-0 lg:max-w-none"
                >
                  <MessageCircle size={17} className="shrink-0 text-csnb-orange-bright" />
                  Nhắn Zalo hỏi nhanh
                  <ArrowRight size={15} className="shrink-0 opacity-80" />
                </Link>
              </div>
            </Reveal>

            {/* Accordion — questions in sans, wider column */}
            <div className="min-w-0 lg:col-span-7">
              <Accordion className="flex flex-col gap-3.5 sm:gap-4">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="not-last:border-b-0 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 shadow-[0_2px_28px_-12px_rgba(6,38,44,0.12)] backdrop-blur-[2px] transition-[border-color,box-shadow] duration-300 hover:border-csnb-orange/25 hover:shadow-[0_12px_40px_-16px_rgba(255,159,67,0.14)] [&:has(button[aria-expanded='true'])]:border-csnb-orange/40 [&:has(button[aria-expanded='true'])]:shadow-[0_14px_44px_-14px_rgba(255,159,67,0.18)]"
                  >
                    <AccordionTrigger className="items-center gap-3 px-4 py-[1.125rem] text-left hover:bg-neutral-50/70 hover:no-underline focus-visible:ring-offset-white sm:gap-4 sm:px-5 sm:py-5 aria-expanded:bg-gradient-to-r aria-expanded:from-csnb-orange/[0.04] aria-expanded:to-transparent [&_[data-slot=accordion-trigger-icon]]:shrink-0 [&_[data-slot=accordion-trigger-icon]]:rounded-full [&_[data-slot=accordion-trigger-icon]]:border [&_[data-slot=accordion-trigger-icon]]:border-csnb-orange/25 [&_[data-slot=accordion-trigger-icon]]:bg-gradient-to-br [&_[data-slot=accordion-trigger-icon]]:from-white [&_[data-slot=accordion-trigger-icon]]:to-csnb-panel [&_[data-slot=accordion-trigger-icon]]:p-2 [&_[data-slot=accordion-trigger-icon]]:text-csnb-orange aria-expanded:[&_[data-slot=accordion-trigger-icon]]:border-csnb-orange/50 aria-expanded:[&_[data-slot=accordion-trigger-icon]]:bg-csnb-orange/12">
                      <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                        <span
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-csnb-panel font-sans text-xs font-bold tabular-nums text-csnb-ink ring-1 ring-csnb-border/30 sm:size-10 sm:text-sm"
                          aria-hidden
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 font-sans text-[0.9375rem] font-semibold leading-relaxed tracking-normal text-csnb-ink sm:text-base sm:leading-relaxed">
                          {faq.q}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-neutral-100/80 bg-gradient-to-br from-csnb-panel/45 via-white to-white">
                      <div className="relative mx-4 mb-5 mt-1 pl-4 sm:mx-5 sm:mb-6 sm:pl-5">
                        <div
                          className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-gradient-to-b from-csnb-orange-deep via-csnb-orange to-csnb-border/45"
                          aria-hidden
                        />
                        <p className="text-pretty whitespace-pre-line font-sans text-sm leading-relaxed text-neutral-700 sm:text-[15px] sm:leading-[1.7]">
                          {faq.a}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
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
                href={SITE_CONTACT.zaloUrl}
                target="_blank"
                className="flex-1 rounded-sm bg-csnb-orange py-2.5 text-center font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
              >
                Liên hệ ngay
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Zalo Button */}
      <motion.a
        href={SITE_CONTACT.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-csnb-orange text-white shadow-lg shadow-csnb-orange/30 transition-colors hover:bg-csnb-orange-deep"
        title="Liên hệ ngay"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 280, damping: 19 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <MessageCircle size={24} />
      </motion.a>
    </div>
  );
}
