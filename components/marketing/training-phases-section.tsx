"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/marketing/reveal";

const trainingPhases = [
  {
    step: "I",
    title: "LÀM QUEN",
    text: "Tôn trọng sự thích nghi từng bước của cơ thể, bạn sẽ học cách chuyển động đúng từng chút một. Dù là tốt, nhưng cơ thể đã quen với cái xấu trong thời gian dài, việc cho cơ thể thích nghi từng bước là cách tốt nhất để tránh bị xung đột và chấn thương không đáng có.",
  },
  {
    step: "II",
    title: "CHUYỂN GIAO",
    text: "Cơ thể đã quen với một trạng thái tốt mới, tiến dần vào các chuyển động phức tạp. Bạn sẽ học cách đối mặt với các thách thức từ các kỹ thuật bài tập, từ đó cơ thể sẽ biết cách ứng phó với môi trường xung quanh để không bị xảy ra các nguy cơ đau không được biết đến từ trước.",
  },
  {
    step: "III",
    title: "HOÀN THIỆN",
    text: 'Đây là giai đoạn "nhẹ nhàng" nhất — khi đã qua chuyển giao, cơ thể bạn đạt được trạng thái mới, gần như không còn đau nữa. Việc tập luyện ở giai đoạn này là TÍCH LŨY để cơ thể bạn không còn bị tổn thương bởi những tai nạn đột ngột.',
  },
] as const;

const trainingCycles = [
  {
    name: "POSTURE RESTORATION",
    desc: "Khôi phục tư thế gốc: giáo dục về tầm quan trọng của TƯ THẾ. Hướng dẫn cách trả về TƯ THẾ TRUNG TÍNH theo cấu trúc riêng của bạn. Biết chính xác cách đặt vị trí lồng ngực, khung chậu, bàn chân vào những ngữ cảnh nhất định, mang tính ứng dụng thực tế.",
  },
  {
    name: "INTEGRATION",
    desc: "Tập luyện phức hợp: học cách chuyển động để cơ bắp tham gia vào các hoạt động thường ngày, giảm áp lực lên khớp. Làm chủ hơi thở giúp cơ thể nhận nhiều oxi, tuần hoàn máu tốt. Tập luyện không chỉ trong phòng tập mà áp dụng vào từng cử chỉ sinh hoạt hằng ngày.",
  },
  {
    name: "FASCIA ENHANCE",
    desc: "Tăng cường mạc cơ dành cho học viên đạt trình độ nhất định và tham gia thể thao (chạy bộ, cầu lông, tennis...). Tập trung vào khả năng phối hợp các khớp để phát lực mạnh mẽ, không bị đứt gãy dẫn đến đau (đau gối do chạy, đau lưng do pickleball...).",
  },
] as const;

const trainingProgressNote =
  "Bạn sẽ cảm thấy nhẹ nhàng hơn ngay sau tuần đầu tiên tập luyện. Sau đó, giảm đau rõ rệt từ tuần thứ 5 trở đi (tỷ lệ trung bình, trường hợp nặng hơn thì tuần thứ 8). Đây là tập luyện để lấy lại cơ thể khỏe mạnh, không giống thuốc giảm đau tức thời — tập luyện là đầu tư, bạn sẽ nhận ra cơ thể đang trẻ hóa dần sau mỗi lần tập. Chúng tôi cần bạn kiên trì và nhẫn nại trong suốt quá trình coaching.";

export function TrainingPhasesSection() {
  return (
    <section className="relative overflow-hidden bg-csnb-bg py-14 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-dark absolute inset-0 opacity-60" aria-hidden />
        <div className="csnb-ambient-grid absolute inset-0 opacity-80" aria-hidden />
        <div className="csnb-ambient-noise absolute inset-0" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 text-center sm:mb-14" y={22}>
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange">
            Nội dung tập luyện
          </span>
          <h2 className="mt-3 font-sans text-2xl font-extrabold leading-snug tracking-normal text-white sm:text-3xl lg:text-4xl">
            Ba phase — chi tiết lộ trình
          </h2>
        </Reveal>

        <Reveal y={22}>
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
              Ba đề mục tập luyện
            </p>
            <h3 className="mt-2 font-sans text-lg font-bold text-white sm:text-xl">
              Posture Restoration · Integration · Fascia Enhance
            </h3>
            <p className="mt-3 max-w-2xl font-sans text-[13px] leading-relaxed text-csnb-muted sm:text-sm">
              <span className="font-medium text-csnb-orange-bright">Posture Restoration</span>
              {" · "}
              <span className="font-medium text-csnb-orange-bright">Integration</span>
              {" · "}
              <span className="font-medium text-csnb-orange-bright">Fascia Enhance</span>
              {" "}
              — ba đề mục luân phiên trong chương trình; mở rộng bên dưới để đọc định nghĩa đầy đủ và tiến trình tập luyện.
            </p>

            <Accordion defaultValue={[]} className="mt-5">
              <AccordionItem
                value="cycles-detail"
                className="not-last:border-b-0 overflow-hidden rounded-xl border border-csnb-border bg-csnb-bg/50"
              >
                <AccordionTrigger className="items-center px-4 py-3.5 hover:no-underline sm:px-5 sm:py-4 [&_[data-slot=accordion-trigger-icon]]:text-csnb-orange-bright">
                  <span className="font-sans text-sm font-semibold text-white">
                    Đọc chi tiết ba đề mục &amp; lộ trình tập
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
  );
}
