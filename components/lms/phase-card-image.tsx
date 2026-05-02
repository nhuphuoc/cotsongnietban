"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

/** Ảnh dự phòng ổn định (Unsplash) khi thumbnail section/khóa lỗi hoặc 404 */
const GLOBAL_FALLBACK =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=340&fit=crop&q=75";

type Props = {
  primary: string;
  fallback: string;
  alt: string;
  sizes: string;
  className?: string;
};

export function PhaseCardImage({ primary, fallback, alt, sizes, className }: Props) {
  const candidates = useMemo(() => {
    const raw = [primary, fallback, GLOBAL_FALLBACK].map((u) => u.trim()).filter(Boolean);
    return [...new Set(raw)];
  }, [primary, fallback]);

  const [idx, setIdx] = useState(0);
  const safeIdx = Math.min(idx, candidates.length - 1);
  const src = candidates[safeIdx] ?? GLOBAL_FALLBACK;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => {
        setIdx((i) => (i < candidates.length - 1 ? i + 1 : i));
      }}
    />
  );
}
