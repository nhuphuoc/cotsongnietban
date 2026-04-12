import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/csnb-logo.jpg";

type Props = {
  className?: string;
  /** Kích thước ô vuông (Tailwind): ví dụ `h-9 w-9 sm:h-10 sm:w-10` */
  boxClassName: string;
  /** `alt` rỗng khi đã có chữ thương hiệu bên cạnh */
  alt?: string;
};

/** Mark logo CSNB (ảnh vuông trong `public/csnb-logo.jpg`). */
export function SiteLogoMark({ className, boxClassName, alt = "Cột Sống Niết Bàn" }: Props) {
  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-md ring-1 ring-black/10 dark:ring-white/15",
        boxClassName
      )}
    >
      <Image src={LOGO_SRC} alt={alt} fill className={cn("object-cover", className)} sizes="96px" />
    </span>
  );
}
