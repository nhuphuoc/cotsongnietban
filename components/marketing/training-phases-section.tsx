"use client";

import { Reveal } from "@/components/marketing/reveal";
import { Activity, Layers, Zap } from "lucide-react";

const trainingCycles = [
  {
    name: "POSTURE RESTORATION",
    icon: Activity,
    desc: "Khôi phục tư thế gốc — học cách đặt lồng ngực, khung chậu, bàn chân về vị trí trung tính theo cấu trúc riêng của bạn.",
  },
  {
    name: "INTEGRATION",
    icon: Layers,
    desc: "Tập luyện phức hợp — đưa chuyển động đúng vào sinh hoạt hằng ngày, làm chủ hơi thở, giảm áp lực lên khớp.",
  },
  {
    name: "FASCIA ENHANCE",
    icon: Zap,
    desc: "Tăng cường mạc cơ — dành cho người chơi thể thao, phối hợp khớp để phát lực mạnh mẽ, tránh chấn thương.",
  },
] as const;

const trainingProgressNote =
  "Nhẹ nhàng hơn sau tuần đầu · giảm đau rõ rệt từ tuần 5–8. Tập luyện là đầu tư — mỗi buổi tập bạn sẽ cảm nhận cơ thể đang khoẻ hơn.";

export function TrainingPhasesSection() {
  return (
    <section className="relative border-t border-csnb-border/15 bg-gradient-to-b from-csnb-panel/40 via-white to-white py-14 sm:py-20 lg:py-28">
      <div className="csnb-panel-depth pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center lg:mb-14" y={22}>
          <h2 className="font-sans text-2xl font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-3xl lg:text-4xl">
            Nội dung tập luyện
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-500 sm:text-base">
            Ba đề mục luân phiên trong chương trình — hiểu đúng, tập đúng, khoẻ bền.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {trainingCycles.map((c, i) => (
            <Reveal key={c.name} y={18} delay={i * 0.08}>
              <div className="group flex h-full flex-col items-start overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(6,38,44,0.06)] ring-1 ring-csnb-border/20 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(6,38,44,0.18)] sm:p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-csnb-orange/10 ring-1 ring-csnb-orange/15">
                  <c.icon className="text-csnb-orange" size={22} strokeWidth={2} />
                </div>
                <h3 className="font-sans text-base font-semibold leading-snug text-csnb-ink">
                  {c.name}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-500">
                  {c.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10" y={14} delay={0.12}>
          <p className="mx-auto max-w-xl text-center font-sans text-sm leading-relaxed text-neutral-400">
            {trainingProgressNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
