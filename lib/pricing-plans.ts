import { SITE_CONTACT } from "@/lib/site-contact";

export type PricingPlan = {
  id: string;
  name: string;
  tag: string;
  priceFrom: string;
  tiers: string[];
  desc: string;
  features: string[];
  popular: boolean;
  registrationUrl?: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "truc-tiep",
    name: "Tập luyện trực tiếp 1-1",
    tag: "TRỰC TIẾP",
    priceFrom: "17TR+",
    tiers: [
      "30 BUỔI — 17.000.000đ (3 tháng)",
      "60 BUỔI — 31.000.000đ (6 tháng)",
      "100 BUỔI — 45.000.000đ (10 tháng)",
    ],
    desc: "Coach theo sát 1-1, quan sát cận chi tiết, sử dụng toàn bộ thiết bị phòng tập.",
    features: [
      "Được đổi giờ nếu bận đột xuất",
      "Chương trình linh hoạt theo tình trạng thực tế (té ngã, đau cấp, chấn thương thể thao...)",
      "Đổi lịch báo trước 1 tuần. Nghỉ đột xuất báo trước 24h — nếu không buổi đó không được bảo lưu",
    ],
    popular: true,
  },
  {
    id: "nhom",
    name: "Tập luyện nhóm 3 người",
    tag: "NHÓM 3",
    priceFrom: "9.6TR",
    tiers: [
      "Khóa 12 tuần — 36 buổi — 9.600.000đ",
      "Mỗi tuần 3 buổi, mỗi buổi 1 tiếng",
      "Cọc 50% giữ chỗ, đủ nhóm trong 30 ngày",
    ],
    desc: "Chi phí tiết kiệm, xếp nhóm cùng trình độ, vẫn được coach quan sát chi tiết.",
    features: [
      "Nghỉ 3 buổi liên tiếp hoặc tổng 6 buổi/khóa → nghỉ vĩnh viễn (không hoàn tiền)",
      "Khóa cố định 12 tuần, nghỉ không bù",
      "Bắt đầu đúng giờ, không chờ người tới trễ",
    ],
    popular: false,
  },
  {
    id: "zoom",
    name: "Trực tuyến trực tiếp (Zoom)",
    tag: "ZOOM",
    priceFrom: "14TR+",
    tiers: [
      "30 BUỔI — 14.000.000đ",
      "60 BUỔI — 26.000.000đ",
      "100 BUỔI — 38.000.000đ",
    ],
    desc: "Ở xa vẫn được coach hướng dẫn trực tiếp 1-1 qua Zoom.",
    features: [
      "Giải quyết khoảng cách địa lý, tập tại nhà",
      "Cần tự mua dụng cụ (dễ tìm trên sàn TMĐT)",
      "Nên có màn hình máy tính + tai nghe để tập hiệu quả",
    ],
    popular: false,
  },
  {
    id: "online",
    name: "Tập luyện gián tiếp — Online Coaching",
    tag: "ONLINE",
    priceFrom: "Tạm ngưng",
    tiers: [
      "Hiện tại đang tạm ngưng",
    ],
    desc: "Tập luyện gián tiếp — Online Coaching.",
    features: [
      "Hiện tại đang tạm ngưng",
    ],
    popular: false,
  },
];
