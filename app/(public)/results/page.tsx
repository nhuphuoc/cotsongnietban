"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Feedback } from "@/types/feedback";

type BeforeAfterRow = Pick<
  Feedback,
  "id" | "customer_name" | "customer_info" | "content" | "image_url_1" | "image_url_2"
>;

type TestimonialRow = Pick<Feedback, "id" | "customer_name" | "customer_info" | "content" | "avatar_url">;

type PublicFeedback = Pick<Feedback, "id" | "customer_name" | "avatar_url" | "content" | "image_url_1" | "created_at">;

type FeedbackApiRow = {
  id: string;
  type?: string;
  customer_name: string | null;
  customer_info: string | null;
  content: string | null;
  avatar_url: string | null;
  image_url_1: string | null;
  image_url_2: string | null;
  created_at: string;
};

function formatDateVi(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const tabTriggerClass =
  "flex-1 rounded-md border border-transparent px-2 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:text-csnb-ink data-active:border-csnb-orange/35 data-active:bg-csnb-orange data-active:text-white data-active:shadow-sm sm:text-xs";

function TabLoading() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-csnb-border/20 bg-white p-10 text-sm text-neutral-500">
      <Loader2 className="mr-2 size-4 animate-spin text-csnb-orange-deep" />
      Đang tải...
    </div>
  );
}

async function fetchFeedbackType(type: string): Promise<FeedbackApiRow[]> {
  const res = await fetch(`/api/feedback?type=${encodeURIComponent(type)}`, { cache: "no-store" });
  const json = (await res.json()) as {
    data?: FeedbackApiRow[];
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Không thể tải feedback.");
  }
  return Array.isArray(json.data) ? json.data : [];
}

export default function ResultsPage() {
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfterRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [comments, setComments] = useState<PublicFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [ba, te, co] = await Promise.all([
          fetchFeedbackType("before_after"),
          fetchFeedbackType("testimonial"),
          fetchFeedbackType("comment"),
        ]);

        if (!mounted) return;

        setBeforeAfter(
          ba.map((r) => ({
            id: r.id,
            customer_name: r.customer_name,
            customer_info: r.customer_info,
            content: r.content,
            image_url_1: r.image_url_1,
            image_url_2: r.image_url_2,
          })),
        );
        setTestimonials(
          te.map((r) => ({
            id: r.id,
            customer_name: r.customer_name,
            customer_info: r.customer_info,
            content: r.content,
            avatar_url: r.avatar_url,
          })),
        );
        setComments(
          co.map((r) => ({
            id: r.id,
            customer_name: r.customer_name,
            avatar_url: r.avatar_url,
            content: r.content,
            image_url_1: r.image_url_1,
            created_at: r.created_at,
          })),
        );
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải feedback.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadAll();
    return () => {
      mounted = false;
    };
  }, []);

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
              {loading ? (
                <TabLoading />
              ) : loadError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError}</div>
              ) : beforeAfter.length === 0 ? (
                <div className="rounded-xl border border-csnb-border/20 bg-white p-6 text-sm text-neutral-600">
                  Chưa có hình trước &amp; sau.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {beforeAfter.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
                    >
                      <div className="grid grid-cols-2 divide-x divide-csnb-border/20">
                        <div className="relative aspect-[3/4] bg-neutral-100">
                          {item.image_url_1 ? (
                            <Image
                              src={item.image_url_1}
                              alt="Trước"
                              fill
                              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center p-2 text-center font-sans text-xs text-neutral-400">
                              Chưa có ảnh
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 rounded-sm bg-white/90 px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-csnb-ink shadow-sm backdrop-blur-sm">
                            Trước
                          </div>
                        </div>
                        <div className="relative aspect-[3/4] bg-neutral-100">
                          {item.image_url_2 ? (
                            <Image
                              src={item.image_url_2}
                              alt="Sau"
                              fill
                              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 17vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center p-2 text-center font-sans text-xs text-neutral-400">
                              Chưa có ảnh
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 rounded-sm bg-csnb-orange px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                            Sau
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-csnb-border/15 bg-white p-4">
                        <div className="font-sans text-sm font-bold text-csnb-ink">{item.customer_name ?? "Học viên"}</div>
                        {item.customer_info ? (
                          <div className="mt-0.5 font-sans text-xs text-neutral-500">{item.customer_info}</div>
                        ) : null}
                        {item.content ? (
                          <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-600">{item.content}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="testimonials" className="outline-none">
              {loading ? (
                <TabLoading />
              ) : loadError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError}</div>
              ) : testimonials.length === 0 ? (
                <div className="rounded-xl border border-csnb-border/20 bg-white p-6 text-sm text-neutral-600">
                  Chưa có chia sẻ từ học viên.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-csnb-border/25 bg-white p-6 shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
                    >
                      <p className="mb-5 font-sans text-sm italic leading-relaxed text-neutral-600">
                        &ldquo;{t.content ?? "—"}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        {t.avatar_url ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-csnb-border/30">
                            <Image src={t.avatar_url} alt={t.customer_name ?? ""} fill sizes="40px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-csnb-panel font-sans text-xs font-bold text-neutral-500 ring-1 ring-csnb-border/30">
                            {(t.customer_name ?? "?").slice(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-sans text-sm font-bold text-csnb-ink">{t.customer_name ?? "Học viên"}</div>
                          {t.customer_info ? (
                            <div className="font-sans text-xs text-neutral-500">{t.customer_info}</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="outline-none">
              {loading ? (
                <TabLoading />
              ) : loadError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError}</div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-csnb-border/20 bg-white p-6 text-sm text-neutral-600">
                  Chưa có feedback công khai.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {comments.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-csnb-border/25">
                            <Image
                              src={item.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"}
                              alt={item.customer_name ?? ""}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-sans text-sm font-bold text-csnb-ink">{item.customer_name}</div>
                            <div className="text-xs text-neutral-500">{formatDateVi(item.created_at)}</div>
                          </div>
                        </div>
                      </div>

                      {item.image_url_1 ? (
                        <div className="mb-3 overflow-hidden rounded-lg">
                          <Image
                            src={item.image_url_1}
                            alt="Ảnh feedback"
                            width={400}
                            height={300}
                            className="w-full object-cover"
                          />
                        </div>
                      ) : null}

                      {item.content ? (
                        <p className="line-clamp-4 font-sans text-sm leading-relaxed text-neutral-700">{item.content}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
