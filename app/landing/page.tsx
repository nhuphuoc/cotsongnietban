import {
  Activity,
  Box,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Menu,
  Package,
  Play,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IMAGES = {
  // Keep "beauty" visuals as remote (replace anytime later).
  hero: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=2400&q=80",
  heroPreview:
    "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=2400&q=80",
  biomechanics:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=80",
  pain: "https://images.unsplash.com/photo-1600431521340-491eca880813?auto=format&fit=crop&w=2400&q=80",
  before1:
    "https://images.unsplash.com/photo-1526401485004-2aa6b2c97b19?auto=format&fit=crop&w=1200&q=80",
  after1:
    "https://images.unsplash.com/photo-1599058918140-5702f7a83aa8?auto=format&fit=crop&w=1200&q=80",
  before2:
    "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?auto=format&fit=crop&w=1200&q=80",
  after2:
    "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1200&q=80",
  before3:
    "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1200&q=80",
  after3:
    "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1200&q=80",
  blog1:
    "https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=1600&q=80",
  blog2:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
  blog3:
    "https://images.unsplash.com/photo-1517838277536-f5f99be50104?auto=format&fit=crop&w=1600&q=80",
};

const FEEDBACK_IMAGES = [
  "/images/fb2.png",
  "/images/fb3.png",
  "/images/fb4.png",
  "/images/fb5.png",
  "/images/fb7.png",
  "/images/fb8.png",
  "/images/fb9.png",
  "/images/fb10.png",
  "/images/fb11.png",
  "/images/feedback1.png",
] as const;

function NavItem({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] text-white/80 hover:text-white transition-colors"
    >
      <span>{label}</span>
      <ChevronDown className="size-4 opacity-80" />
    </button>
  );
}

function PlaceholderImage({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur",
        className ?? "",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-6 h-48 w-72 rotate-12 bg-red-700/20 blur-2xl" />
        <div className="absolute -right-24 bottom-6 h-48 w-72 -rotate-12 bg-amber-400/15 blur-2xl" />
      </div>
      <div className="relative flex h-full w-full items-center justify-center">
        <span className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
          {label}
        </span>
      </div>
    </div>
  );
}

function MediaCard({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]",
        className ?? "",
      ].join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="text-xs font-extrabold tracking-[0.22em]">
              COTSONGNIETBANLOGO
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <NavItem label="PROGRAMS" />
            <NavItem label="GET CERTIFIED" />
            <NavItem label="EQUIPMENT" />
            <NavItem label="ACCESSORIES" />
            <NavItem label="RESULTS" />
            <NavItem label="MORE" />
          </nav>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white/80 hover:text-white hover:bg-white/5"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu />
              </DialogTrigger>
              <DialogContent className="border border-white/10 bg-black text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    COTSONGNIETBAN
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                  {[
                    "PROGRAMS",
                    "GET CERTIFIED",
                    "EQUIPMENT",
                    "ACCESSORIES",
                    "RESULTS",
                    "MORE",
                  ].map((label) => (
                    <Button
                      key={label}
                      variant="ghost"
                      className="justify-between rounded-lg bg-white/5 text-white hover:bg-white/10"
                    >
                      <span className="text-xs font-semibold tracking-[0.18em]">
                        {label}
                      </span>
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/5"
              aria-label="Search"
            >
              <Search />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/5"
              aria-label="User"
            >
              <User />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/5"
              aria-label="Packages"
            >
              <Box />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/5"
              aria-label="Cart"
            >
              <ShoppingCart />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* 1) THE HOOK (Hero with video background) */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black" />
            <Image
              src={IMAGES.hero}
              alt="Training background"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 opacity-70">
              <div className="absolute -left-32 top-12 h-72 w-96 rotate-12 bg-red-700/25 blur-3xl" />
              <div className="absolute -right-32 bottom-10 h-72 w-96 -rotate-12 bg-amber-400/15 blur-3xl" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
            <div className="flex flex-col justify-center">
              <p className="mb-5 text-[11px] font-semibold tracking-[0.22em] text-white/70">
                TIN VUI !!! THOÁT VỊ KHÔNG CÒN LÀM PHIỀN CUỘC SỐNG CỦA BẠN NỮA
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Chấm Dứt Cơn Đau. Lấy Lại Phong Độ.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                Hãy tập trung vào chính bạn — sức khỏe là quan trọng nhất!
                <br />
                <br />
                CỘT SỐNG NIẾT BÀN không chỉ là một chương trình tập luyện mà còn
                là một hệ thống chăm sóc và phát triển sức khỏe với cột sống làm
                trọng tâm. Thông qua các bài tập kết hợp giữa kỹ thuật thể dục,
                trị liệu phục hồi và giáo dục tư thế, chương trình được thiết kế
                nhằm: phục hồi các tổn thương cột sống, tăng cường sự ổn định và
                sức mạnh vùng hông–chậu–lưng, tối ưu hóa khả năng linh hoạt và
                kiểm soát cơ thể.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button className="h-12 rounded-none bg-red-700 px-6 text-white hover:bg-red-800">
                  BẮT ĐẦU QUIZ 1 PHÚT
                  <Play className="ml-2 size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-none border-white/20 bg-transparent px-6 text-white/85 hover:bg-white/5 hover:text-white"
                >
                  ĐĂNG KÝ TƯ VẤN
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/60">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5">
                  <ShieldCheck className="size-4 text-amber-300/90" />
                  Lộ trình rõ ràng
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5">
                  <Activity className="size-4 text-amber-300/90" />
                  Theo dõi tiến độ
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5">
                  <HeartPulse className="size-4 text-amber-300/90" />
                  Tập đúng — bền vững
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <MediaCard
                  src={IMAGES.heroPreview}
                  alt="Physio training preview"
                  className="aspect-video"
                />
                <div className="pointer-events-none -mt-10 px-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur">
                    <div className="text-xs font-semibold tracking-[0.18em] text-white/75">
                      VIDEO PREVIEW
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/70">
                      <Package className="size-4" />
                      BUNNY.NET LATER
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/50">
                  Sau này thay bằng video background tập luyện/phục hồi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2) THE TRUST BANNER */}
        <section className="border-b border-white/10 bg-gradient-to-b from-black to-zinc-950/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold tracking-tight text-white/90">
              Phương pháp tập luyện{" "}
              <span className="text-amber-400">không dùng thuốc</span>, không
              tác dụng phụ — đầu tư sức khỏe bền vững về lâu dài
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-white/45">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                PHỤC HỒI CHỨC NĂNG
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                CÁ NHÂN HÓA
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                THEO SÁT TIẾN TRÌNH
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                KHÔNG TÁI PHÁT
              </div>
            </div>
          </div>
        </section>

        {/* 3) THE PROBLEM */}
        <section className="border-b border-white/10 bg-zinc-950/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                BẠN CÓ ĐANG GẶP VẤN ĐỀ NÀY KHÔNG?
              </p>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Bạn đã thử đủ cách… nhưng cơn đau vẫn quay lại?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Bạn đã thử châm cứu, massage, yoga, kéo giãn… nhưng cơn đau vẫn
                quay lại đúng không? Lý do là các cơ tham gia hỗ trợ cột sống
                của bạn đã lâu không được sử dụng đúng cách, dẫn đến yếu dần và
                bù trừ. Nếu chỉ “đỡ tạm” mà không chỉnh lại nền tảng, cơn đau sẽ
                còn làm phiền bạn.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: HeartPulse, title: "Đau lưng dưới", desc: "Mỏi, căng, đau âm ỉ kéo dài." },
                  { icon: Activity, title: "Thần kinh tọa", desc: "Tê lan, đau nhói xuống chân." },
                  { icon: ShieldCheck, title: "Thoát vị/đau đĩa đệm", desc: "Đau tái phát khi vận động." },
                  { icon: Stethoscope, title: "Sai tư thế", desc: "Gù, lệch hông, lệch vai." },
                ].map((it) => (
                  <div
                    key={it.title}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-white/10">
                      <it.icon className="size-5 text-white/80" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold tracking-tight">
                        {it.title}
                      </div>
                      <div className="mt-1 text-sm text-white/65">
                        {it.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <MediaCard
                  src={IMAGES.pain}
                  alt="Pain and rehab concept"
                  className="aspect-[16/11]"
                />
                <p className="mt-3 text-xs text-white/50">
                  Placeholder cho hình minh hoạ “nỗi đau”/vùng đau.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4) THE SOLUTION */}
        <section className="border-b border-white/10 bg-gradient-to-b from-black to-zinc-950/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
            <div className="order-2 flex items-center justify-center md:order-1">
              <div className="w-full max-w-2xl">
                <MediaCard
                  src={IMAGES.biomechanics}
                  alt="Biomechanics correction"
                  className="aspect-[16/11]"
                />
                <p className="mt-3 text-xs text-white/50">
                  Placeholder cho hình giải phẫu/biomechanics hoặc video chỉnh dáng.
                </p>
              </div>
            </div>

            <div className="order-1 flex flex-col justify-center md:order-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                GIẢI PHÁP TỪ CỘT SỐNG NIẾT BÀN
              </p>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Phương pháp phục hồi dựa trên nền tảng cơ học vận động
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Chúng tôi cung cấp phương thức tập luyện và theo sát tiến trình
                của bạn. TẬP LUYỆN CHỨC NĂNG sẽ dựa vào mô phỏng chuyển động tự
                nhiên của cơ thể người, đồng thời chỉnh lại cách bạn đứng —
                bước — chịu lực — thở. Thời gian đầu có thể khó, vì cơ bị mất
                chức năng sẽ “báo hiệu”, nhưng đây là điều cần phải diễn ra
                trong quá trình phục hồi.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Bạn sẽ cảm thấy nhẹ nhàng hơn ngay sau tuần đầu tiên tập luyện.
                Sau đó, bạn sẽ cảm thấy giảm đau từ tuần thứ 5 trở đi (tỷ lệ trung
                bình, trường hợp nặng hơn thì tuần thứ 8 trở đi).
                <br />
                <br />
                Vì đây là tập luyện để bạn lấy lại cơ thể khỏe mạnh, không giống
                như thuốc giảm đau tức thời và gây hại về lâu dài. Tập luyện là
                đầu tư, bạn sẽ nhận ra cơ thể bạn đang trẻ hóa dần sau mỗi lần tập.
              </p>

              <div className="mt-7 grid gap-3">
                {[
                  {
                    icon: Sparkles,
                    title: "Đánh giá nhanh & rõ ràng",
                    desc: "Xác định điểm sai cơ học gây đau (không lan man).",
                  },
                  {
                    icon: Dumbbell,
                    title: "Bài tập tối giản — hiệu quả",
                    desc: "Tập đúng vị trí, đúng hướng lực, đúng mức độ.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Tập trung vào bền vững",
                    desc: "Giảm tái phát bằng nền tảng tư thế & sức mạnh.",
                  },
                ].map((it) => (
                  <div
                    key={it.title}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-white/10">
                      <it.icon className="size-5 text-white/80" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold tracking-tight">
                        {it.title}
                      </div>
                      <div className="mt-1 text-sm text-white/65">
                        {it.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button className="h-11 rounded-none bg-red-700 px-5 text-white hover:bg-red-800">
                  XEM LỘ TRÌNH PHỤC HỒI
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-none border-white/15 bg-transparent px-5 text-white/80 hover:bg-white/5 hover:text-white"
                >
                  HỎI ĐÁP NHANH
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAM OVERVIEW (from legacy Google Form) */}
        <section className="border-b border-white/10 bg-zinc-950/40">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="grid gap-10 md:grid-cols-2 md:items-start">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  CỘT SỐNG NIẾT BÀN
                </p>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Hành trình khôi phục &amp; phát triển cột sống toàn diện
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                  Chào bạn! CỘT SỐNG NIẾT BÀN không chỉ là một chương trình tập
                  luyện, mà còn là một hệ thống chăm sóc và phát triển sức khỏe
                  với cột sống làm trọng tâm. Thông qua các bài tập kết hợp
                  giữa kỹ thuật thể dục, trị liệu phục hồi và giáo dục tư thế,
                  chương trình được thiết kế nhằm giúp bạn đi từ “đau — hạn chế
                  cử động” đến “khỏe — tự tin vận động”.
                </p>

                <div className="mt-7 grid gap-3">
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Phục hồi tổn thương cột sống",
                      desc: "Tập trung vào nền tảng vận động và giảm bù trừ.",
                    },
                    {
                      icon: Activity,
                      title: "Tăng ổn định vùng hông–chậu–lưng",
                      desc: "Xây lại sức mạnh đúng chỗ, đúng hướng lực.",
                    },
                    {
                      icon: HeartPulse,
                      title: "Tối ưu linh hoạt & kiểm soát cơ thể",
                      desc: "Cải thiện kiểm soát chuyển động trong sinh hoạt.",
                    },
                  ].map((it) => (
                    <div
                      key={it.title}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-white/10">
                        <it.icon className="size-5 text-white/80" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold tracking-tight">
                          {it.title}
                        </div>
                        <div className="mt-1 text-sm text-white/65">
                          {it.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs leading-6 text-white/45">
                  Lưu ý: Nội dung mang tính giáo dục vận động và không thay thế
                  chẩn đoán/tư vấn y khoa.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  ĐỐI TƯỢNG PHÙ HỢP (ONLINE COACHING)
                </div>
                <div className="mt-4 grid gap-3 text-sm text-white/70">
                  <div className="flex gap-3">
                    <div className="mt-1 size-2 rounded-full bg-amber-400/80" />
                    <div>
                      Thoát vị/thoái hoá/hẹp đĩa đệm… đã khám/chụp phim{" "}
                      <span className="text-white">trên 6 tháng</span> (thể nhẹ,
                      không quá 7mm).
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 size-2 rounded-full bg-amber-400/80" />
                    <div>
                      Đau lưng khi cúi gập (rửa chén, ngồi làm việc, chơi thể
                      thao…) thể nhẹ; có thể được đề xuất chụp phim nếu cần.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 size-2 rounded-full bg-amber-400/80" />
                    <div>
                      Đau khớp mãn tính (trên 3 tháng) đã điều trị nhưng không
                      hết.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 size-2 rounded-full bg-amber-400/80" />
                    <div>
                      Muốn tập để khỏe hệ cơ–xương–khớp ngay cả khi chưa có triệu
                      chứng.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  title: "Khắc phục triệt để",
                  desc: "Khắc phục triệt để các tình trạng cột sống, đau khớp hay các bệnh lý vật lý khác.",
                },
                {
                  title: "Được hướng dẫn cụ thể trong suốt quá trình",
                  desc: "Bạn không cần phải lo ngại về việc phải đi tìm phương pháp khác nữa.",
                },
                {
                  title: "Không dùng thuốc, không tác dụng phụ",
                  desc: "Phương pháp tập luyện mang tính đầu tư sức khỏe về lâu dài.",
                },
                {
                  title: "Cung cấp kiến thức về bệnh lý",
                  desc: "Sau khi tập luyện với chúng tôi, bạn sẽ không bị đau trở lại nữa.",
                },
                {
                  title: "Chương trình tập CÁ NHÂN HÓA",
                  desc: "Phù hợp với từng người, từng tình trạng khác nhau.",
                },
                {
                  title: "Kiến thức tổ chức lối sống lành mạnh",
                  desc: "Các triệu chứng bạn mắc phải có thể xuất phát từ nhiều bệnh lý tiềm ẩn do lối sống và sinh hoạt thiếu điều độ.",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-sm font-extrabold tracking-tight">
                    {b.title}
                  </div>
                  <div className="mt-2 text-sm text-white/65">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRAINING CONTENT / PHASES */}
        <section className="border-b border-white/10 bg-gradient-to-b from-black to-zinc-950/60">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                NỘI DUNG TẬP LUYỆN
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Chương trình tập luyện PHỤC HỒI CHỨC NĂNG CƠ — XƯƠNG — KHỚP (3 phase)
              </h2>
              <p className="max-w-3xl text-sm text-white/70 sm:text-base">
                Chương trình được chia làm 3 phase và mỗi phase có 3 chu kỳ luân
                phiên xen kẽ: <span className="text-white">MOBILIZATION</span>{" "}
                (di động khớp) — <span className="text-white">ACTIVATION</span>{" "}
                (ổn định) — <span className="text-white">INTEGRATION</span>{" "}
                (phối hợp toàn thân). Sau mỗi chu kỳ, bạn sẽ được tiếp cận bài
                tập khó hơn để cơ thể thích nghi liên tục.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  tag: "PHASE I",
                  title: "Movement Restoration",
                  desc: "Khôi phục các cơ tham gia chuyển động khớp bị tổn thương để khớp giảm tải; trọng tâm vùng hông–chậu–thắt lưng.",
                },
                {
                  tag: "PHASE II",
                  title: "Accumulation",
                  desc: "Tăng “trí nhớ cơ”, tăng sức bền thông qua mật độ lặp lại; mở rộng ra vùng lân cận như T-spine.",
                },
                {
                  tag: "PHASE III",
                  title: "Intensification",
                  desc: "Tác động sâu hơn vào vùng thắt lưng với gập/duỗi/uốn cong; yêu cầu nền tảng 2 phase trước để an toàn và hiệu quả.",
                },
              ].map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                    {p.tag}
                  </div>
                  <div className="mt-2 text-lg font-extrabold tracking-tight">
                    {p.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/65">
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Mobilization",
                  desc: "Tăng biên độ khớp, ngưỡng kháng cự, khả năng cơ co–duỗi để đạt hiệu quả chuyển động.",
                },
                {
                  title: "Activation",
                  desc: "Học cách ổn định tư thế và huy động sức căng cơ đúng chỗ khi chuyển động.",
                },
                {
                  title: "Integration",
                  desc: "Bài tập phối hợp nhiều khớp, độ khó cao; khi làm được, hệ cơ trở lại chức năng bảo vệ cột sống.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="text-sm font-extrabold tracking-tight">
                    {c.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/65">
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KNOWLEDGE VAULT (light mode transition) */}
        <section className="bg-white text-zinc-950">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                KHO KIẾN THỨC (KNOWLEDGE VAULT)
              </h2>
              <p className="max-w-3xl text-sm text-zinc-600 sm:text-base">
                Tụi mình cung cấp thêm các kiến thức về tình trạng bạn đang mắc
                phải và cách tổ chức lối sống lành mạnh. Khi hiểu đúng, bạn sẽ
                biết cách bảo vệ cột sống để hạn chế đau quay lại.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-b border-zinc-200 pb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">
              <button className="text-red-700">TẤT CẢ</button>
              <button className="hover:text-zinc-950 transition-colors">
                ĐAU &amp; RỐI LOẠN
              </button>
              <button className="hover:text-zinc-950 transition-colors">
                PHƯƠNG PHÁP TẬP
              </button>
              <button className="hover:text-zinc-950 transition-colors">
                TRỊ LIỆU BỔ TRỢ
              </button>
              <button className="hover:text-zinc-950 transition-colors">
                TÂM LÝ &amp; THÓI QUEN
              </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  img: IMAGES.blog1,
                  title: "POSTURE MATTERS. BUT NOT FOR THE REASONS YOU'VE BEEN TOLD.",
                  desc:
                    "Most people think posture means pulling your shoulders back... others believe fixing it is magically correct kyphosis...",
                },
                {
                  img: IMAGES.blog2,
                  title: "WHY RECOVERY MATTERS FROM A FUNCTIONAL PATTERNS PERSPECTIVE",
                  desc:
                    "Many people battling chronic pain are paradoxically training the most active... from group workouts to solo routines...",
                },
                {
                  img: IMAGES.blog3,
                  title: "VISCOELASTICITY AND 4TH PHASE WATER",
                  desc:
                    "When you fix your biomechanics, you improve viscoelasticity of your fascia which allows it to carry more fourth phase...",
                },
              ].map((post) => (
                <Card key={post.title} className="rounded-none border-zinc-200">
                  <div className="relative aspect-[16/10] w-full bg-zinc-100">
                    <Image
                      src={post.img}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base font-extrabold leading-6">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-zinc-600">
                      {post.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5) THE PROOF */}
        <section className="border-b border-white/10 bg-zinc-950/40">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                MỘT SỐ FEEDBACKS
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                BẰNG CHỨNG THÉP: BEFORE/AFTER &amp; CẢM NHẬN HỌC VIÊN
              </h2>
              <p className="max-w-3xl text-sm text-white/70 sm:text-base">
                Trong ngành sức khỏe, Before/After là vua. Đây là những feedback
                khách hàng đã gửi trong quá trình coaching. Bạn có thể xem để tự
                cảm nhận sự thay đổi về mức độ đau, khả năng di chuyển trong ngày,
                sinh hoạt, làm việc…
              </p>
            </div>

            <div className="mt-8">
              <Tabs defaultValue="before-after" className="w-full">
                <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="before-after"
                    className="rounded-none border border-white/10 bg-white/5 text-white/80 data-[state=active]:bg-red-700 data-[state=active]:text-white"
                  >
                    BEFORE &amp; AFTER
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="rounded-none border border-white/10 bg-white/5 text-white/80 data-[state=active]:bg-red-700 data-[state=active]:text-white"
                  >
                    VIDEO CHIA SẺ
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="rounded-none border border-white/10 bg-white/5 text-white/80 data-[state=active]:bg-red-700 data-[state=active]:text-white"
                  >
                    COMMENTS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="before-after" className="mt-6">
                  <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {FEEDBACK_IMAGES.map((src, idx) => (
                      <div
                        key={src}
                        className="min-w-[260px] sm:min-w-[340px]"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          <Image
                            src={src}
                            alt={`Before/After feedback ${idx + 1}`}
                            fill
                            sizes="(max-width: 768px) 80vw, 340px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/80">
                            BEFORE/AFTER
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {FEEDBACK_IMAGES.slice(0, 6).map((src, idx) => (
                      <div
                        key={src}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40">
                          <Image
                            src={src}
                            alt={`Video testimonial preview ${idx + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                          <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/80">
                            TESTIMONIAL
                          </div>
                        </div>
                        <div className="mt-3 text-sm font-extrabold tracking-tight">
                          Feedback học viên #{idx + 1}
                        </div>
                        <div className="mt-1 text-sm text-white/65">
                          “Giảm đau rõ rệt sau khi chỉnh lại tư thế và bài tập.”
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-6">
                  <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
                    {FEEDBACK_IMAGES.map((src, idx) => (
                      <div
                        key={src}
                        className="break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <div className="relative">
                          <Image
                            src={src}
                            alt={`Customer feedback screenshot ${idx + 1}`}
                            width={1200}
                            height={1200}
                            className="h-auto w-full object-cover"
                          />
                          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/80">
                            FEEDBACK
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* 6) THE OFFER & FAQ */}
        <section className="bg-gradient-to-b from-black to-zinc-950/70">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="grid gap-10">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  THE OFFER
                </p>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Chọn hình thức coaching — bắt đầu phục hồi ngay
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                  Đây không phải là chi phí “tính theo số buổi”, mà là chi phí cho
                  toàn bộ thời gian trị liệu bao gồm cố vấn sức khỏe, tập luyện,
                  theo sát tiến trình và ưu tiên xử lý khi bạn gặp vấn đề bất ngờ
                  trong sinh hoạt hằng ngày.
                </p>

                <div className="mt-6 grid gap-2 text-sm text-white/70">
                  <div className="flex gap-3">
                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400/80" />
                    <div>Chương trình tập được xây dựng và theo sát học viên.</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400/80" />
                    <div>
                      Giải đáp thắc mắc liên quan bệnh lý và kỹ thuật tập luyện.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400/80" />
                    <div>
                      Mục tiêu: giảm đau, tăng khả năng vận động và hạn chế tái phát.
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {[
                    {
                      tag: "TRỰC TIẾP",
                      title: "Tập luyện trực tiếp",
                      price: "17TR+",
                      desc: "Được hướng dẫn bởi các coach có bề dày kinh nghiệm về khắc phục bệnh lý cột sống và đau khớp mãn tính. Ngoài tập luyện, học viên được tham gia các buổi giải cơ trị liệu để thúc đẩy lưu thông máu, giảm đau và tăng khả năng hồi phục. Bất cứ trường hợp khẩn cấp nào luôn được ưu tiên xử lý ngay lập tức.",
                      detailLines: [
                        "30 BUỔI — 17.000.000 (3 THÁNG)",
                        "60 BUỔI — 31.000.000 (6 THÁNG)",
                        "100 BUỔI — 45.000.000 (10 THÁNG)",
                      ],
                    },
                    {
                      tag: "ZOOM",
                      title: "Tập luyện trực tuyến trực tiếp (Zoom)",
                      price: "14TR+",
                      desc: "Dành cho những ai ở xa và muốn được hướng dẫn trực tiếp thông qua gọi điện trực tuyến. Người học sẽ không sợ bị tập sai hoặc không biết chọn bài tập phù hợp. Chương trình tập được xây dựng dựa theo tình trạng từng ngày và được trực tiếp giải đáp thắc mắc liên quan bệnh lý.",
                      detailLines: [
                        "30 BUỔI — 14.000.000",
                        "60 BUỔI — 26.000.000",
                        "100 BUỔI — 38.000.000",
                      ],
                    },
                    {
                      tag: "ONLINE",
                      title: "Tập luyện gián tiếp — Online Coaching",
                      price: "LINK",
                      desc: "Theo sát tiến trình và hướng dẫn cụ thể trong suốt quá trình. Bạn không cần phải lo ngại về việc đi tìm phương pháp khác nữa.",
                      detailLines: [
                        "THÔNG TIN & ĐĂNG KÝ: (link form chính thức)",
                      ],
                    },
                  ].map((p) => (
                    <Card
                      key={p.title}
                      className="h-full rounded-2xl border-white/10 bg-white/5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
                    >
                      <CardHeader className="space-y-2 pb-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                            {p.tag}
                          </div>
                          <div className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/70">
                            ƯU TIÊN THEO SÁT
                          </div>
                        </div>
                        <CardTitle className="text-lg font-extrabold leading-6">
                          {p.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-white/65 line-clamp-3">
                          {p.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col">
                        <div className="text-4xl font-extrabold tracking-tight text-amber-400">
                          {p.price}
                        </div>
                        <ul className="mt-3 space-y-1 text-xs leading-5 text-white/60">
                          {p.detailLines.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span className="mt-2 size-1 shrink-0 rounded-full bg-white/25" />
                              <span className="min-w-0">{line}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-4">
                          <Button className="h-11 w-full rounded-none bg-red-700 text-white hover:bg-red-800">
                            XEM CHI TIẾT
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                    LỊCH TẬP GỢI Ý
                  </div>
                  <div className="mt-3 text-sm text-white/70">
                    Người mới bắt đầu thường tập{" "}
                    <span className="text-white font-semibold">3 buổi/tuần</span>, mỗi
                    buổi khoảng{" "}
                    <span className="text-white font-semibold">60 phút</span>.
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    Với ONLINE COACHING: nếu bạn tạo được một khung thời gian cố
                    định thì quá tốt, như thế đồng hồ sinh học sẽ được thiết lập
                    để phục vụ việc tập luyện tối ưu nhất. Trường hợp không tạo
                    được cũng không sao, miễn thỏa điều kiện tập trung 100% tinh
                    thần vào buổi tập.
                  </div>
                </div>
              </div>

              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  FAQ
                </p>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight sm:text-2xl">
                  Những câu hỏi thường gặp
                </h3>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
                  <Accordion className="w-full">
                    <AccordionItem value="q1" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Tôi bị thoát vị 5 năm có học được không?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Có. Lộ trình sẽ được điều chỉnh theo nền tảng chịu lực và
                        mức độ đau hiện tại. Mục tiêu là giảm bù trừ và tăng khả
                        năng vận động an toàn.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q2" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Học online có hiệu quả không?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Có. Người học sẽ không sợ bị tập sai hoặc không biết chọn
                        bài tập phù hợp vì chương trình được xây dựng theo tình
                        trạng và sẽ được theo sát tiến trình. Điều quan trọng là
                        bạn tập trung 100% và làm đúng kỹ thuật.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q3" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Tôi cần dụng cụ gì không?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Phần lớn bài tập tối giản và có biến thể. Khi cần thêm
                        dụng cụ, chương trình sẽ hướng dẫn rõ.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q4" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Tập bao lâu thì sẽ thấy rõ hiệu quả?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Bạn sẽ cảm thấy nhẹ nhàng hơn ngay sau tuần đầu tiên
                        tập luyện. Sau đó, bạn sẽ cảm thấy giảm đau từ tuần
                        thứ 5 trở đi (tỷ lệ trung bình, trường hợp nặng hơn
                        thì tuần thứ 8 trở đi). Vì đây là tập luyện để bạn
                        lấy lại cơ thể khỏe mạnh, không giống như thuốc giảm
                        đau tức thời và gây hại về lâu dài. Tập luyện là đầu
                        tư — bạn sẽ nhận ra cơ thể bạn đang trẻ hóa dần sau
                        mỗi lần tập. Vì vậy, chúng tôi cần bạn kiên trì và
                        nhẫn nại trong suốt quá trình coaching diễn ra.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q5" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Chương trình tập này có phát triển cơ không?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Phát triển cơ là điều ưu tiên hàng đầu trong chương
                        trình tập luyện này. Khác với khái niệm phì đại cơ
                        (hypertrophy), tập luyện chức năng sẽ phát triển những
                        nhóm cơ bên trong — cơ bám xương (LOCAL MUSCLES). Khi
                        những cơ này khỏe mạnh, cơ thể bạn sẽ được thiết lập
                        lại cấu trúc vững vàng hơn và giảm đau. Ngoài ra, gân
                        và dây chằng cũng được tăng cường, giúp cơ thể dẻo dai
                        và tự do di chuyển mà không cần lo lắng né tránh các
                        cử động gây đau.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q6" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Chương trình tập này có giảm mỡ không?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Tùy mức độ. Giảm mỡ căn bản cần một hệ trao đổi chất
                        tốt và thâm hụt calories. Trong chương trình hướng dẫn
                        ăn uống của Cột Sống Niết Bàn có gợi ý cách ăn uống
                        hỗ trợ để không tạo ra calories dư thừa. Nếu cơ thể
                        bạn kém và có nhiều bệnh nền, việc giảm mỡ sẽ diễn ra
                        chậm hơn ở giai đoạn đầu. Song khi cơ thể bạn khỏe
                        mạnh hơn từng giai đoạn, quá trình giảm mỡ diễn ra
                        suôn sẻ hơn. Cơ thể khỏe mạnh sẽ tạo ra một cơ thể
                        đẹp.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q7" className="border-white/10">
                      <AccordionTrigger className="px-3 text-left text-white">
                        Tôi có được tư vấn trước khi đăng ký không?
                      </AccordionTrigger>
                      <AccordionContent className="px-3 text-white/70">
                        Có. Bạn có thể đăng ký tư vấn để được định hướng gói
                        phù hợp với tình trạng của mình. Trong trường hợp cần
                        thiết, sau khi trao đổi về các triệu chứng, tôi sẽ đề
                        xuất bạn có nên đi chụp phim để xem tình trạng có nguy
                        hiểm hay không.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Button className="h-11 rounded-none bg-red-700 px-5 text-white hover:bg-red-800">
                    ĐĂNG KÝ TƯ VẤN
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-none border-white/15 bg-transparent px-5 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    XEM KẾT QUẢ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-xs font-extrabold tracking-[0.22em] text-white">
                COTSONGNIETBANLOGO
              </div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
                CỘT SỐNG NIẾT BÀN — chương trình tập luyện &amp; phục hồi chức
                năng lấy cột sống làm trọng tâm.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 md:col-span-2 md:grid-cols-3">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  MENU
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/70">
                  <a className="hover:text-white" href="#">
                    Programs
                  </a>
                  <a className="hover:text-white" href="#">
                    Results
                  </a>
                  <a className="hover:text-white" href="#">
                    Knowledge Vault
                  </a>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  LIÊN HỆ
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/70">
                  <a className="hover:text-white" href="#">
                    Zalo / WhatsApp
                  </a>
                  <a className="hover:text-white" href="#">
                    Facebook
                  </a>
                  <a className="hover:text-white" href="#">
                    Email
                  </a>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
                  CHÍNH SÁCH
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/70">
                  <a className="hover:text-white" href="#">
                    Terms
                  </a>
                  <a className="hover:text-white" href="#">
                    Privacy
                  </a>
                  <a className="hover:text-white" href="#">
                    Refund
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} COTSONGNIETBAN. All rights reserved.</div>
            <div className="text-white/45">
              Made for recovery, strength, and longevity.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
