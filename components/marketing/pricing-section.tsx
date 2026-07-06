"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/marketing/reveal";
import { SITE_CONTACT } from "@/lib/site-contact";
import { pricingPlans, type PricingPlan } from "@/lib/pricing-plans";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PricingSection() {
  const [pricingDialog, setPricingDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleOpenPricing = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setPricingDialog(true);
  };

  return (
    <>
      <section id="pricing" className="relative scroll-mt-24 overflow-hidden bg-csnb-bg py-14 sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=900&fit=crop&q=70"
            alt=""
            fill
            className="object-cover opacity-[0.18] blur-3xl saturate-[1.1]"
            sizes="100vw"
            aria-hidden
            loading="lazy"
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
            <p className="mx-auto max-w-xl text-pretty font-sans text-base leading-relaxed text-csnb-muted sm:text-lg">
              Nếu bạn không tự tin trong việc tập luyện một mình, hãy để chúng tôi đồng hành
            </p>
            <h2 className="mt-3 font-sans text-2xl font-extrabold leading-snug tracking-normal text-white sm:text-3xl lg:text-4xl">
              Các hình thức tập luyện
            </h2>
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
                    {plan.tiers.map((tier, j) => (
                      <li key={j} className="flex items-baseline gap-2">
                        <span
                          aria-hidden
                          className="shrink-0 translate-y-px font-sans text-[0.8125rem] font-semibold leading-snug text-csnb-orange"
                        >
                          ›
                        </span>
                        <span className="min-w-0 flex-1 font-sans text-xs leading-snug text-white">{tier}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
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
        </div>
      </section>

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
    </>
  );
}
