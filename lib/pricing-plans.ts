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
    name: "Tập luyện trực tiếp",
    tag: "TRỰC TIẾP",
    priceFrom: "17TR+",
    tiers: [
      "30 BUỔI — 17.000.000đ (3 tháng)",
      "60 BUỔI — 31.000.000đ (6 tháng)",
      "100 BUỔI — 45.000.000đ (10 tháng)",
    ],
    desc: "Coach kinh nghiệm cột sống & đau khớp mãn tính; theo sát 1-1.",
    features: [
      "Có buổi giải cơ trị liệu kèm theo",
      "Ưu tiên xử lý khẩn cấp và chỉnh lộ trình kịp thời",
      "Chi phí trọn gói theo thời gian (không chỉ tính buổi): cố vấn, tập, hỗ trợ khi có sự cố ở nhà/công ty",
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
    desc: "Ở xa vẫn được coach hướng dẫn trực tiếp qua Zoom.",
    features: [
      "Chương trình theo tình trạng từng ngày của học viên",
      "Giải đáp thắc mắc & thông tin bệnh lý trực tiếp",
      "Học viên tập ngoài phòng hoặc tự chuẩn bị dụng cụ thuận tiện",
    ],
    popular: true,
  },
  {
    id: "online",
    name: "Online Coaching (gián tiếp)",
    tag: "ONLINE",
    priceFrom: "Liên hệ",
    tiers: [
      "Đăng ký qua Google Form (thông tin liên hệ)",
      "Lộ trình cá nhân hóa theo từng người, từng tình trạng",
      "Theo sát & hướng dẫn cụ thể trong suốt quá trình",
    ],
    desc: "Theo sát online, lộ trình rõ — không phải tự mò phương pháp.",
    features: [
      "Kết hợp kỹ thuật thể dục, trị liệu phục hồi & giáo dục tư thế",
      "Sau khi đặt câu hỏi triệu chứng, sẽ gợi ý có nên chụp film khi cần",
      "Ưu tiên kiến thức bệnh lý & tổ chức lối sống lành mạnh lâu dài",
    ],
    popular: false,
    registrationUrl: SITE_CONTACT.onlineCoachingFormUrl,
  },
];
