import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmailAsync } from "@/lib/email/send";
import { CourseExpiringEmail } from "@/lib/email/templates/course-expiring";

export const runtime = "nodejs";

/**
 * API dùng cho cron job kiểm tra enrollment sắp hết hạn và gửi email cảnh báo.
 *
 * Gọi: GET /api/cron/check-expiring-enrollments
 * Hoặc: POST (nếu cần body/secret)
 *
 * Trigger: nên gọi 1 lần/ngày qua Vercel Cron hoặc external cron.
 *
 * Logic:
 * - Kiểm tra các enrollment active có expires_at trong vòng 7, 3, 1 ngày tới
 * - Chỉ gửi email nếu chưa gửi cho milestone đó (dùng email_logs.metadata)
 * - Fire-and-forget: không block response
 */
export async function GET() {
  try {
    const admin = createAdminClient();

    // Lấy tất cả enrollment active có expires_at
    const { data: enrollments, error } = await admin
      .from("enrollments")
      .select(`
        id,
        expires_at,
        user_id,
        course_id,
        profiles!inner(email, full_name),
        courses!inner(title, slug)
      `)
      .eq("status", "active")
      .not("expires_at", "is", null)
      .order("expires_at", { ascending: true });

    if (error) {
      console.error("[cron:expiring] DB error:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    const now = Date.now();
    type Milestone = { days: number; minDays: number; maxDays: number };
    const milestones: Milestone[] = [
      { days: 7, minDays: 4, maxDays: 7 },   // 7-4 ngày → báo lần 1
      { days: 3, minDays: 2, maxDays: 3 },    // 3-2 ngày → báo lần 2
      { days: 1, minDays: 1, maxDays: 1 },    // 1 ngày   → báo lần cuối
    ];
    let sentCount = 0;

    for (const enrollment of (enrollments ?? [])) {
      if (!enrollment.expires_at) continue;

      const expiresMs = new Date(enrollment.expires_at).getTime();
      const daysLeft = Math.ceil((expiresMs - now) / (86400 * 1000));

      // Tìm milestone phù hợp (theo khoảng)
      const milestone = milestones.find(
        (m) => daysLeft >= m.minDays && daysLeft <= m.maxDays
      );
      if (!milestone) continue;

      // Lấy thông tin user + course
      const email = (enrollment.profiles as unknown as { email?: string })?.email;
      const fullName = (enrollment.profiles as unknown as { full_name?: string })?.full_name;
      const courseTitle = (enrollment.courses as unknown as { title?: string })?.title;
      const courseSlug = (enrollment.courses as unknown as { slug?: string })?.slug;

      if (!email) continue;

      // Kiểm tra email_logs xem đã gửi cho enrollment + milestone này chưa
      const { data: existing } = await admin
        .from("email_logs")
        .select("id")
        .eq("recipient", email)
        .eq("template", "course_expiring")
        .gte("created_at", new Date(now - 14 * 86400 * 1000).toISOString())
        .contains("metadata", { enrollmentId: enrollment.id, milestoneDays: milestone.days })
        .maybeSingle();

      if (existing) continue; // Đã gửi cho enrollment + milestone này rồi

      const displayName = fullName?.trim() || email.split("@")[0];
      const title = courseTitle?.trim() || "khóa học";
      const expiresFormatted = new Date(enrollment.expires_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Tạo course URL
      const origin = process.env.NEXT_PUBLIC_SITE_URL
        ? `https://${process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}`
        : "https://cotsongnietban.vn";
      const courseUrl = `${origin}/phong-hoc/courses/${courseSlug || enrollment.course_id}`;

      sendEmailAsync({
        to: email,
        subject: `Sắp hết hạn: ${title} — còn ${daysLeft} ngày`,
        template: "course_expiring",
        react: CourseExpiringEmail({
          customerName: displayName,
          courseTitle: title,
          daysLeft,
          courseUrl,
          expiresAt: expiresFormatted,
        }),
        metadata: {
          enrollmentId: enrollment.id,
          milestoneDays: milestone.days,
          daysLeft,
        },
      });

      sentCount++;
    }

    return Response.json({
      success: true,
      checked: (enrollments ?? []).length,
      sent: sentCount,
    });
  } catch (err) {
    console.error("[cron:expiring] Unexpected error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
