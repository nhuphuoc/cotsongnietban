"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const beforeAfterData = [
  { name: "Nguyễn Văn A", issue: "Thoát vị L4-L5", duration: "3 tháng", before: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=300&h=400&fit=crop" },
  { name: "Trần Thị B", issue: "Đau lưng mãn tính", duration: "2 tháng", before: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1549476464-37392f717541?w=300&h=400&fit=crop" },
  { name: "Lê Minh C", issue: "Vai gáy căng cứng", duration: "6 tuần", before: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&h=400&fit=crop" },
  { name: "Phạm Thu D", issue: "Đau gót chân", duration: "8 tuần", before: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=300&h=400&fit=crop" },
  { name: "Hoàng Văn E", issue: "Chấn thương đầu gối", duration: "4 tháng", before: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=400&fit=crop" },
  { name: "Ngô Thị F", issue: "Vẹo cột sống nhẹ", duration: "5 tháng", before: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=400&fit=crop" },
];

const testimonials = [
  { name: "Chị Lan Anh", role: "Nhân viên văn phòng, 34 tuổi", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop", text: "Sau 3 tháng học, cơn đau lưng mãn tính của tôi gần như biến mất hoàn toàn. Tôi có thể ngồi làm việc 8 tiếng mà không đau nữa. Phương pháp này thực sự thay đổi cuộc sống tôi!", rating: 5 },
  { name: "Anh Minh Tuấn", role: "Vận động viên, 28 tuổi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", text: "Tôi bị thoát vị đĩa đệm L5-S1 và đã không thể tập luyện 6 tháng. Sau khóa học, tôi đã quay lại thi đấu và thành tích còn tốt hơn trước.", rating: 5 },
  { name: "Chị Thu Hương", role: "Giáo viên, 42 tuổi", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", text: "Tôi đứng dạy cả ngày và bị đau gót chân kinh niên. Chỉ 6 tuần với khóa học này, tôi đã đứng thoải mái và không cần uống thuốc giảm đau nữa.", rating: 5 },
  { name: "Anh Quốc Hùng", role: "Kỹ sư xây dựng, 38 tuổi", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", text: "Công việc tôi phải đứng nhiều và mang vác nặng. Sau 2 tháng học, tôi hiểu cách bảo vệ cột sống và không còn về nhà với cơn đau lưng nữa.", rating: 5 },
  { name: "Chị Bảo Châu", role: "Vũ công, 25 tuổi", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop", text: "Là vũ công, chấn thương là nỗi ám ảnh lớn nhất. Khóa học này giúp tôi hiểu cơ thể mình hơn và tập luyện an toàn, hiệu quả hơn rất nhiều.", rating: 5 },
  { name: "Anh Trọng Nhân", role: "Lập trình viên, 31 tuổi", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", text: "Ngồi code 10-12 tiếng mỗi ngày khiến lưng và cổ tôi rất tệ. Chỉ sau 4 tuần áp dụng kỹ thuật trong khóa học, tôi đã cảm thấy khác biệt rõ rệt.", rating: 5 },
];

const tabTriggerClass =
  "flex-1 rounded-md border border-transparent px-2 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:text-csnb-ink data-active:border-csnb-orange/35 data-active:bg-csnb-orange data-active:text-white data-active:shadow-sm sm:text-xs";

export default function ResultsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-[0.45]" aria-hidden />
      </div>

      <section className="relative z-10 border-b border-csnb-border/20 bg-white/80 py-14 backdrop-blur-sm lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange-deep">
            Minh chứng thực tế
          </span>
          <h1 className="mt-3 font-sans text-3xl font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-4xl lg:text-5xl">
            Kết quả học viên
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-sans text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base">
            Những câu chuyện và hình ảnh minh họa từ cộng đồng tập luyện cùng Cột Sống Niết Bàn.
          </p>
        </div>
      </section>

      <section className="relative z-10 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="before-after" className="w-full">
            <TabsList className="mx-auto mb-10 flex h-auto w-full max-w-xl rounded-lg border border-csnb-border/25 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
              <TabsTrigger value="before-after" className={cn(tabTriggerClass)}>
                Trước &amp; sau
              </TabsTrigger>
              <TabsTrigger value="testimonials" className={cn(tabTriggerClass)}>
                Chia sẻ
              </TabsTrigger>
              <TabsTrigger value="comments" className={cn(tabTriggerClass)}>
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="before-after" className="outline-none">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {beforeAfterData.map((item, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
                  >
                    <div className="grid grid-cols-2 divide-x divide-csnb-border/20">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.before}
                          alt="Trước"
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 rounded-sm bg-white/90 px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-csnb-ink shadow-sm backdrop-blur-sm">
                          Trước
                        </div>
                      </div>
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.after}
                          alt="Sau"
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 right-2 rounded-sm bg-csnb-orange px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                          Sau
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-csnb-border/15 bg-white p-4">
                      <div className="font-sans text-sm font-bold text-csnb-ink">{item.name}</div>
                      <div className="mt-0.5 font-sans text-xs text-csnb-orange-deep">{item.issue}</div>
                      <div className="mt-1 font-sans text-xs text-neutral-500">{item.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="testimonials" className="outline-none">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-csnb-border/25 bg-white p-6 shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} className="fill-csnb-orange text-csnb-orange-deep" />
                      ))}
                    </div>
                    <p className="mb-5 font-sans text-sm italic leading-relaxed text-neutral-600">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-csnb-border/30">
                        <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-sans text-sm font-bold text-csnb-ink">{t.name}</div>
                        <div className="font-sans text-xs text-neutral-500">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="outline-none">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                  <div
                    key={n}
                    className="relative aspect-[9/16] overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-sm transition-shadow hover:border-csnb-orange/30 hover:shadow-md"
                  >
                    <Image
                      src={`/images/fb${n}.png`}
                      alt={`Feedback ${n}`}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, (max-width: 1279px) 25vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
