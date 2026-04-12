/** Dữ liệu hiển thị marketing (giá, học viên, outcomes…) — tách khỏi LMS demo */

export type CatalogMarketingExtras = {
  priceLabel: string;
  studentCount: number;
};

export const catalogMarketingExtras: Record<string, CatalogMarketingExtras> = {
  "1": { priceLabel: "2.500.000đ", studentCount: 420 },
  "2": { priceLabel: "2.900.000đ", studentCount: 210 },
  "3": { priceLabel: "1.800.000đ", studentCount: 380 },
  "4": { priceLabel: "2.200.000đ", studentCount: 165 },
};

export function getCatalogMarketingExtras(courseId: string): CatalogMarketingExtras {
  return (
    catalogMarketingExtras[courseId] ?? {
      priceLabel: "Liên hệ",
      studentCount: 120,
    }
  );
}

export type DetailMarketingMeta = {
  rating: string;
  instructorName: string;
  instructorTitle: string;
  outcomes: string[];
  trustLine: string;
};

const defaultOutcomes = [
  "Video bài giảng HD, xem lại không giới hạn",
  "Tài liệu & checklist theo từng buổi",
  "Theo dõi tiến độ trên nền tảng",
  "Gợi ý chỉnh động tác an toàn cho cột sống",
  "Tư vấn trực tiếp trong giờ làm việc",
];

export const detailMarketingMeta: Record<string, Partial<DetailMarketingMeta>> = {
  "1": {
    rating: "4,9",
    instructorName: "Coach CSNB",
    instructorTitle: "Chuyên gia phục hồi chức năng",
    outcomes: [
      "12 module từ nền đến hip hinge an toàn",
      "Bài tập thở, mobility và activation có video",
      "Biết khi nào dừng và khi nào cần coach",
      "Kế hoạch tập tại nhà rõ ràng theo tuần",
      "Giảm đau lưng nhẹ–vừa theo hướng dẫn y khoa",
      "Tự tin duy trì thói quen vận động dài hạn",
    ],
    trustLine: "Thanh toán an toàn · Hoàn tiền trong 7 ngày (theo chính sách demo).",
  },
  "2": {
    rating: "4,8",
    instructorName: "Coach CSNB",
    instructorTitle: "Corrective exercise",
    outcomes: defaultOutcomes,
  },
  "3": {
    rating: "4,9",
    instructorName: "Coach CSNB",
    instructorTitle: "Ergonomics & cổ vai",
    outcomes: defaultOutcomes,
  },
  "4": {
    rating: "4,7",
    instructorName: "Coach CSNB",
    instructorTitle: "Chạy bền & hông–gối",
    outcomes: defaultOutcomes,
  },
};

export function getDetailMarketingMeta(courseId: string): DetailMarketingMeta {
  const base = detailMarketingMeta[courseId];
  return {
    rating: base?.rating ?? "4,8",
    instructorName: base?.instructorName ?? "Coach CSNB",
    instructorTitle: base?.instructorTitle ?? "Huấn luyện viên",
    outcomes: base?.outcomes ?? defaultOutcomes,
    trustLine:
      base?.trustLine ??
      "Thanh toán an toàn · Chính sách hoàn tiền theo gói đăng ký (demo).",
  };
}
