"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const beforeAfterData = [
  { name: "Nguyễn Văn A", issue: "Thoát vị L4-L5", duration: "3 tháng", before: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=300&h=400&fit=crop" },
  { name: "Trần Thị B", issue: "Đau lưng mãn tính", duration: "2 tháng", before: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1549476464-37392f717541?w=300&h=400&fit=crop" },
  { name: "Lê Minh C", issue: "Vai gáy căng cứng", duration: "6 tuần", before: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&h=400&fit=crop" },
  { name: "Phạm Thu D", issue: "Đau gót chân", duration: "8 tuần", before: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=300&h=400&fit=crop" },
  { name: "Hoàng Văn E", issue: "Chấn thương đầu gối", duration: "4 tháng", before: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=400&fit=crop" },
  { name: "Ngô Thị F", issue: "Vẹo cột sống nhẹ", duration: "5 tháng", before: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=400&fit=crop", after: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=400&fit=crop" },
];

const testimonials = [
  { name: "Chị Lan Anh", role: "Nhân viên văn phòng, 34 tuổi", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop", text: "Sau 3 tháng học, cơn đau lưng mãn tính của tôi gần như biến mất hoàn toàn. Tôi có thể ngồi làm việc 8 tiếng mà không đau nữa. Phương pháp này thực sự thay đổi cuộc sống tôi!", rating: 5 },
  { name: "Anh Minh Tuấn", role: "Vận động viên, 28 tuổi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", text: "Tôi bị thoát vị đĩa đệm L5-S1 và đã không thể tập luyện 6 tháng. Sau khóa học, tôi đã quay lại thi đấu và thành tích còn tốt hơn trước.", rating: 5 },
  { name: "Chị Thu Hương", role: "Giáo viên, 42 tuổi", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", text: "Tôi đứng dạy cả ngày và bị đau gót chân kinh niên. Chỉ 6 tuần với khóa học này, tôi đã đứng thoải mái và không cần uống thuốc giảm đau nữa.", rating: 5 },
  { name: "Anh Quốc Hùng", role: "Kỹ sư xây dựng, 38 tuổi", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", text: "Công việc tôi phải đứng nhiều và mang vác nặng. Sau 2 tháng học, tôi hiểu cách bảo vệ cột sống và không còn về nhà với cơn đau lưng nữa.", rating: 5 },
  { name: "Chị Bảo Châu", role: "Vũ công, 25 tuổi", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop", text: "Là vũ công, chấn thương là nỗi ám ảnh lớn nhất. Khóa học này giúp tôi hiểu cơ thể mình hơn và tập luyện an toàn, hiệu quả hơn rất nhiều.", rating: 5 },
  { name: "Anh Trọng Nhân", role: "Lập trình viên, 31 tuổi", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", text: "Ngồi code 10-12 tiếng mỗi ngày khiến lưng và cổ tôi rất tệ. Chỉ sau 4 tuần áp dụng kỹ thuật trong khóa học, tôi đã cảm thấy khác biệt rõ rệt.", rating: 5 },
];

export default function ResultsPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-20 border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c0392b] font-heading font-bold text-sm uppercase tracking-widest">
            Minh Chứng Thực Tế
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl uppercase text-white mt-3">
            Kết Quả Học Viên
          </h1>
          <p className="text-[#a0a0a0] text-base mt-4 max-w-xl mx-auto">
            Hơn 59,000 học viên đã thay đổi cuộc sống. Đây là những câu chuyện thực tế từ cộng đồng của chúng tôi.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="before-after" className="w-full">
            <TabsList className="bg-[#111] border border-[#222] rounded-sm p-1 mb-10 flex w-full max-w-lg mx-auto">
              <TabsTrigger value="before-after" className="flex-1 text-xs font-heading font-bold uppercase tracking-wide rounded-sm data-[state=active]:bg-[#c0392b] data-[state=active]:text-white text-[#a0a0a0]">
                Before & After
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex-1 text-xs font-heading font-bold uppercase tracking-wide rounded-sm data-[state=active]:bg-[#c0392b] data-[state=active]:text-white text-[#a0a0a0]">
                Testimonials
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1 text-xs font-heading font-bold uppercase tracking-wide rounded-sm data-[state=active]:bg-[#c0392b] data-[state=active]:text-white text-[#a0a0a0]">
                Comments
              </TabsTrigger>
            </TabsList>

            {/* Before & After */}
            <TabsContent value="before-after">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {beforeAfterData.map((item, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] rounded-sm overflow-hidden hover:border-[#c0392b]/30 transition-colors">
                    <div className="grid grid-cols-2 divide-x divide-[#222]">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.before}
                          alt="Before"
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-[#0a0a0a]/80 text-[#a0a0a0] text-xs px-2 py-1 rounded font-heading">TRƯỚC</div>
                      </div>
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.after}
                          alt="After"
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-[#c0392b] text-white text-xs px-2 py-1 rounded font-heading font-bold">SAU</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] rounded-sm p-6 hover:border-[#c0392b]/30 transition-colors">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} className="text-[#e67e22] fill-[#e67e22]" />
                      ))}
                    </div>
                    <p className="text-[#a0a0a0] text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                  <div key={n} className="relative aspect-[9/16] rounded-sm overflow-hidden border border-[#222] hover:border-[#c0392b]/40 transition-colors">
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
