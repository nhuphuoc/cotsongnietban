import { redirect } from "next/navigation";
import { getLmsHomeHref } from "@/lib/learning-hub";

/** Cổng ngắn trên site chính → chuyển tới phòng học (hub hoặc /dashboard). */
export default function PhongHocGatewayPage() {
  redirect(getLmsHomeHref());
}
