import { createAdminClient } from "@/utils/supabase/admin";
import { listPublishedLessonIdsInCourse } from "@/lib/lms/build-lms-course-view-model";

type JsonRecord = Record<string, unknown>;

const PUBLIC_COURSE_FIELDS =
  "id, title, slug, short_description, description, extra_info, thumbnail_url, hero_image_url, trailer_url, price_vnd, access_duration_days, access_note, is_featured, status, published_at, created_at, updated_at";
const PUBLIC_LESSON_FIELDS =
  "id, course_id, section_id, title, slug, summary, duration_seconds, is_preview, is_published, sort_order";

function admin() {
  return createAdminClient();
}

/** PostgREST `id.eq.x` ép `x` sang kiểu cột `id` (uuid) → slug có chữ như `i` gây lỗi 22P02. */
function isUuidString(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

function enrichEnrollmentRows(
  enrollments: Array<Record<string, unknown>>,
  coursesById: Map<string, unknown>,
  lessonsById: Map<string, unknown>
) {
  return enrollments.map((item) => ({
    ...item,
    course: coursesById.get(String(item.course_id)) ?? null,
    last_lesson: item.last_lesson_id ? lessonsById.get(String(item.last_lesson_id)) ?? null : null,
  }));
}

function mapPublicLesson(lesson: Record<string, unknown>) {
  return {
    id: lesson.id,
    course_id: lesson.course_id,
    section_id: lesson.section_id,
    title: lesson.title,
    slug: lesson.slug,
    summary: lesson.summary,
    duration_seconds: lesson.duration_seconds,
    is_preview: lesson.is_preview,
    is_published: lesson.is_published,
    sort_order: lesson.sort_order,
  };
}

export async function getPublicCourseByIdentifier(identifier: string) {
  const client = admin();
  const key = identifier.trim();
  let q = client.from("courses").select(PUBLIC_COURSE_FIELDS).eq("status", "published");
  q = isUuidString(key) ? q.or(`id.eq.${key},slug.eq.${key}`) : q.eq("slug", key);
  const { data: course, error } = await q.limit(1).maybeSingle();

  if (error) throw error;
  if (!course) return null;

  const [{ data: category }, { data: sections }, { data: lessons }] = await Promise.all([
    course.category_id
      ? client.from("course_categories").select("*").eq("id", course.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    client.from("course_sections").select("*").eq("course_id", course.id).order("sort_order"),
    client
      .from("lessons")
      .select(PUBLIC_LESSON_FIELDS)
      .eq("course_id", course.id)
      .eq("is_published", true)
      .order("sort_order"),
  ]);

  const lessonsBySectionId = new Map<string, ReturnType<typeof mapPublicLesson>[]>();
  const ungrouped: ReturnType<typeof mapPublicLesson>[] = [];

  for (const lesson of lessons ?? []) {
    const safeLesson = mapPublicLesson(lesson);
    if (lesson.section_id) {
      const current = lessonsBySectionId.get(lesson.section_id) ?? [];
      current.push(safeLesson);
      lessonsBySectionId.set(lesson.section_id, current);
    } else {
      ungrouped.push(safeLesson);
    }
  }

  return {
    ...course,
    category: category ?? null,
    sections: (sections ?? []).map((section) => ({
      ...section,
      lessons: lessonsBySectionId.get(section.id) ?? [],
    })),
    lessons: (lessons ?? []).map(mapPublicLesson),
    ungroupedLessons: ungrouped,
  };
}

export async function listCourses(options?: { publishedOnly?: boolean }) {
  const client = admin();
  let query = client.from("courses").select("*").order("created_at", { ascending: false });
  if (options?.publishedOnly) {
    query = query.eq("status", "published");
  }
  const { data, error } = await query;
  if (error) throw error;

  const courses = data ?? [];
  const courseIds = courses.map((course) => course.id);

  const [{ data: categories, error: categoriesError }, { data: sections, error: sectionsError }] =
    await Promise.all([
      client.from("course_categories").select("*"),
      courseIds.length
        ? client.from("course_sections").select("*").in("course_id", courseIds).order("sort_order")
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (categoriesError) throw categoriesError;
  if (sectionsError) throw sectionsError;

  const categoriesById = new Map((categories ?? []).map((item) => [item.id, item]));
  const sectionsByCourseId = new Map<string, unknown[]>();

  for (const section of sections ?? []) {
    const current = sectionsByCourseId.get(section.course_id) ?? [];
    current.push(section);
    sectionsByCourseId.set(section.course_id, current);
  }

  return courses.map((course) => ({
    ...course,
    category: course.category_id ? categoriesById.get(course.category_id) ?? null : null,
    sections: sectionsByCourseId.get(course.id) ?? [],
  }));
}

export async function getCourseByIdentifier(identifier: string) {
  const client = admin();
  const key = identifier.trim();
  let base = client.from("courses").select("*");
  base = isUuidString(key) ? base.or(`id.eq.${key},slug.eq.${key}`) : base.eq("slug", key);
  const { data: course, error } = await base.limit(1).maybeSingle();
  if (error) throw error;
  if (!course) return null;

  const [{ data: category }, { data: sections }, { data: lessons }] = await Promise.all([
    course.category_id
      ? client.from("course_categories").select("*").eq("id", course.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    client.from("course_sections").select("*").eq("course_id", course.id).order("sort_order"),
    client.from("lessons").select("*").eq("course_id", course.id).order("sort_order"),
  ]);

  const lessonsBySectionId = new Map<string, unknown[]>();
  const ungrouped: unknown[] = [];

  for (const lesson of lessons ?? []) {
    if (lesson.section_id) {
      const current = lessonsBySectionId.get(lesson.section_id) ?? [];
      current.push(lesson);
      lessonsBySectionId.set(lesson.section_id, current);
    } else {
      ungrouped.push(lesson);
    }
  }

  return {
    ...course,
    category: category ?? null,
    sections: (sections ?? []).map((section) => ({
      ...section,
      lessons: lessonsBySectionId.get(section.id) ?? [],
    })),
    lessons: lessons ?? [],
    ungroupedLessons: ungrouped,
  };
}

export async function listBlogPosts(options?: { publishedOnly?: boolean }) {
  const client = admin();
  let query = client.from("blog_posts").select("*").order("published_at", { ascending: false, nullsFirst: false });
  if (options?.publishedOnly) {
    query = query.eq("status", "published");
  }
  const { data, error } = await query;
  if (error) throw error;

  const posts = data ?? [];
  const categoryIds = [...new Set(posts.map((post) => post.category_id).filter(Boolean))];
  const { data: categories, error: categoriesError } = categoryIds.length
    ? await client.from("blog_categories").select("*").in("id", categoryIds)
    : { data: [], error: null };

  if (categoriesError) throw categoriesError;
  const categoriesById = new Map((categories ?? []).map((item) => [item.id, item]));

  return posts.map((post) => ({
    ...post,
    category: post.category_id ? categoriesById.get(post.category_id) ?? null : null,
  }));
}

export async function getBlogPostByIdentifier(identifier: string) {
  const client = admin();
  const key = identifier.trim();
  let q = client.from("blog_posts").select("*");
  q = isUuidString(key) ? q.or(`id.eq.${key},slug.eq.${key}`) : q.eq("slug", key);
  const { data: post, error } = await q.limit(1).maybeSingle();

  if (error) throw error;
  if (!post) return null;

  const { data: category, error: categoryError } = post.category_id
    ? await client.from("blog_categories").select("*").eq("id", post.category_id).maybeSingle()
    : { data: null, error: null };

  if (categoryError) throw categoryError;
  return { ...post, category: category ?? null };
}

export async function incrementBlogPostViewCount(postId: string) {
  const client = admin();
  const { data: post, error: readError } = await client.from("blog_posts").select("view_count").eq("id", postId).maybeSingle();
  if (readError) throw readError;
  if (!post) return;

  const { error: updateError } = await client
    .from("blog_posts")
    .update({ view_count: (post.view_count ?? 0) + 1 })
    .eq("id", postId);
  if (updateError) throw updateError;
}

export async function listFeedbacks() {
  const client = admin();
  const { data, error } = await client
    .from("feedbacks")
    .select("id, type, customer_name, customer_info, content, avatar_url, image_url_1, image_url_2, is_active, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getFeedbackById(id: string) {
  const client = admin();
  const { data, error } = await client
    .from("feedbacks")
    .select("id, type, customer_name, customer_info, content, avatar_url, image_url_1, image_url_2, is_active, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function listOrders() {
  const client = admin();
  const { data: orders, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;

  const orderIds = (orders ?? []).map((item) => item.id);
  const [itemsResult, profilesResult] = await Promise.all([
    orderIds.length
      ? client.from("order_items").select("*").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    client.from("profiles").select("id, full_name, email"),
  ]);

  if (itemsResult.error) throw itemsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const profilesById = new Map((profilesResult.data ?? []).map((item) => [item.id, item]));
  const itemsByOrderId = new Map<string, unknown[]>();
  for (const item of itemsResult.data ?? []) {
    const current = itemsByOrderId.get(item.order_id) ?? [];
    current.push(item);
    itemsByOrderId.set(item.order_id, current);
  }

  return (orders ?? []).map((order) => ({
    ...order,
    user: order.user_id ? profilesById.get(order.user_id) ?? null : null,
    items: itemsByOrderId.get(order.id) ?? [],
  }));
}

export async function getOrderById(id: string) {
  const client = admin();
  const { data: order, error } = await client.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!order) return null;

  const [{ data: items, error: itemsError }, profileResult] = await Promise.all([
    client.from("order_items").select("*").eq("order_id", id).order("created_at"),
    order.user_id
      ? client.from("profiles").select("id, full_name, email").eq("id", order.user_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (itemsError) throw itemsError;
  if (profileResult.error) throw profileResult.error;

  return {
    ...order,
    user: profileResult.data ?? null,
    items: items ?? [],
  };
}

export async function listProfiles() {
  const client = admin();
  const { data: profiles, error } = await client.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;

  const profileIds = (profiles ?? []).map((item) => item.id);
  const { data: enrollments, error: enrollmentsError } = profileIds.length
    ? await client.from("enrollments").select("id, user_id, status, course_id").in("user_id", profileIds)
    : { data: [], error: null };

  if (enrollmentsError) throw enrollmentsError;

  const courseIds = [...new Set((enrollments ?? []).map((item) => item.course_id).filter(Boolean))];
  const { data: courses, error: coursesError } = courseIds.length
    ? await client.from("courses").select("id, title, slug").in("id", courseIds)
    : { data: [], error: null };

  if (coursesError) throw coursesError;

  const courseById = new Map((courses ?? []).map((item) => [item.id, item]));
  const enrollmentsByUserId = new Map<string, unknown[]>();

  for (const enrollment of enrollments ?? []) {
    const current = enrollmentsByUserId.get(enrollment.user_id) ?? [];
    current.push({
      ...enrollment,
      course: courseById.get(enrollment.course_id) ?? null,
    });
    enrollmentsByUserId.set(enrollment.user_id, current);
  }

  return (profiles ?? []).map((profile) => ({
    ...profile,
    enrollments: enrollmentsByUserId.get(profile.id) ?? [],
  }));
}

export async function getProfileById(id: string) {
  const client = admin();
  const { data: profile, error } = await client.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: enrollments, error: enrollmentsError } = await client
    .from("enrollments")
    .select("id, user_id, status, course_id")
    .eq("user_id", id);

  if (enrollmentsError) throw enrollmentsError;

  const courseIds = [...new Set((enrollments ?? []).map((item) => item.course_id).filter(Boolean))];
  const { data: courses, error: coursesError } = courseIds.length
    ? await client.from("courses").select("id, title, slug").in("id", courseIds)
    : { data: [], error: null };

  if (coursesError) throw coursesError;

  const courseById = new Map((courses ?? []).map((item) => [item.id, item]));

  return {
    ...profile,
    enrollments: (enrollments ?? []).map((item) => ({
      ...item,
      course: courseById.get(item.course_id) ?? null,
    })),
  };
}

export async function listEnrollmentsForUser(userId: string) {
  const client = admin();
  const { data: enrollments, error } = await client
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const courseIds = [...new Set((enrollments ?? []).map((item) => item.course_id).filter(Boolean))];
  const lessonIds = [...new Set((enrollments ?? []).map((item) => item.last_lesson_id).filter(Boolean))];

  const [coursesResult, lessonsResult] = await Promise.all([
    courseIds.length
      ? client
          .from("courses")
          .select("id, title, slug, thumbnail_url, short_description")
          .in("id", courseIds)
      : Promise.resolve({ data: [], error: null }),
    lessonIds.length
      ? client.from("lessons").select("id, title, slug, course_id").in("id", lessonIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (coursesResult.error) throw coursesResult.error;
  if (lessonsResult.error) throw lessonsResult.error;

  const coursesById = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));
  const lessonsById = new Map((lessonsResult.data ?? []).map((item) => [item.id, item]));

  return enrichEnrollmentRows(enrollments ?? [], coursesById, lessonsById);
}

export async function listAccessibleEnrollmentsForUser(userId: string) {
  const client = admin();
  const nowIso = new Date().toISOString();
  const { data: enrollments, error } = await client
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    // PostgREST `or`: timestamp must be quoted so `:` in ISO string does not break parsing.
    .or(`expires_at.is.null,expires_at.gt."${nowIso}"`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const courseIds = [...new Set((enrollments ?? []).map((item) => item.course_id).filter(Boolean))];
  const lessonIds = [...new Set((enrollments ?? []).map((item) => item.last_lesson_id).filter(Boolean))];

  const [coursesResult, lessonsResult] = await Promise.all([
    courseIds.length
      ? client
          .from("courses")
          .select("id, title, slug, thumbnail_url, short_description")
          .in("id", courseIds)
      : Promise.resolve({ data: [], error: null }),
    lessonIds.length
      ? client.from("lessons").select("id, title, slug, course_id").in("id", lessonIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (coursesResult.error) throw coursesResult.error;
  if (lessonsResult.error) throw lessonsResult.error;

  const coursesById = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));
  const lessonsById = new Map((lessonsResult.data ?? []).map((item) => [item.id, item]));

  return enrichEnrollmentRows(enrollments ?? [], coursesById, lessonsById);
}

/** Khóa học đầy đủ + enrollment active + tiến độ bài học (chỉ khi user đã đăng ký hợp lệ). */
export async function getEnrollmentCourseBundleForUser(userId: string, courseIdentifier: string) {
  const fullCourse = await getCourseByIdentifier(courseIdentifier);
  if (!fullCourse) return null;

  const client = admin();
  const nowIso = new Date().toISOString();
  const { data: enrollment, error: enrErr } = await client
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", fullCourse.id)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt."${nowIso}"`)
    .maybeSingle();

  if (enrErr) throw enrErr;
  if (!enrollment) return null;

  const { data: progRows, error: progErr } = await client
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("enrollment_id", enrollment.id);

  if (progErr) throw progErr;

  const completedLessonIds = new Set<string>();
  for (const row of progRows ?? []) {
    if (row.is_completed && row.lesson_id) {
      completedLessonIds.add(String(row.lesson_id));
    }
  }

  return { enrollment, course: fullCourse, completedLessonIds };
}

/**
 * Ghi nhận hoàn thành / bỏ hoàn thành một bài (đã publish) trong khóa user đang học;
 * upsert `lesson_progress` và đồng bộ `completed_lessons`, `progress_percent`, `last_lesson_id` trên enrollment.
 */
export async function applyLessonProgressForUser(
  userId: string,
  courseIdentifier: string,
  lessonId: string,
  isCompleted: boolean
) {
  const bundle = await getEnrollmentCourseBundleForUser(userId, courseIdentifier);
  if (!bundle) return null;

  const publishedIds = listPublishedLessonIdsInCourse(bundle.course);
  const publishedSet = new Set(publishedIds);
  const lid = String(lessonId);
  if (!publishedSet.has(lid)) return null;

  const client = admin();
  const enrollmentId = String(bundle.enrollment.id);
  const now = new Date().toISOString();

  const { error: upErr } = await client.from("lesson_progress").upsert(
    {
      enrollment_id: enrollmentId,
      lesson_id: lid,
      is_completed: isCompleted,
      completed_at: isCompleted ? now : null,
    },
    { onConflict: "enrollment_id,lesson_id" }
  );
  if (upErr) throw upErr;

  const { data: progRows, error: progErr2 } = await client
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("enrollment_id", enrollmentId);

  if (progErr2) throw progErr2;

  let completedCount = 0;
  for (const row of progRows ?? []) {
    if (row.is_completed && row.lesson_id && publishedSet.has(String(row.lesson_id))) {
      completedCount += 1;
    }
  }

  const total = publishedIds.length;
  const progressPercent = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

  const { error: enUpErr } = await client
    .from("enrollments")
    .update({
      completed_lessons: completedCount,
      progress_percent: progressPercent,
      last_lesson_id: lid,
      last_activity_at: now,
    })
    .eq("id", enrollmentId);

  if (enUpErr) throw enUpErr;

  return getEnrollmentCourseBundleForUser(userId, courseIdentifier);
}

export async function getCoursePurchaseStateForUser(userId: string, courseId: string) {
  const client = admin();

  const { data: enrollmentRows, error: enrollmentError } = await client
    .from("enrollments")
    .select("id, status, created_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (enrollmentError) throw enrollmentError;
  const enrollment = enrollmentRows?.[0] ?? null;

  const { data: itemRows, error: itemError } = await client
    .from("order_items")
    .select("order_id")
    .eq("course_id", courseId);

  if (itemError) throw itemError;

  const orderIds = [...new Set((itemRows ?? []).map((row) => row.order_id).filter(Boolean))];
  let latestOrder: {
    id: string;
    order_code: string;
    status: string;
    total_vnd: number;
    payment_reference: string | null;
    created_at: string;
  } | null = null;

  if (orderIds.length > 0) {
    const { data: orders, error: ordersError } = await client
      .from("orders")
      .select("id, order_code, status, total_vnd, payment_reference, created_at")
      .eq("user_id", userId)
      .in("id", orderIds)
      .in("status", ["pending", "paid", "approved"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (ordersError) throw ordersError;
    latestOrder = orders?.[0] ?? null;
  }

  return {
    hasEnrollment: Boolean(enrollment),
    enrollment,
    hasOpenOrder: Boolean(latestOrder),
    latestOrder,
    alreadyPurchased: Boolean(enrollment || latestOrder),
  };
}

export async function resolveCategoryId(table: "course_categories" | "blog_categories", input?: string | null) {
  if (!input) return null;
  const client = admin();
  const key = input.trim();
  let q = client.from(table).select("id");
  q = isUuidString(key) ? q.or(`id.eq.${key},slug.eq.${key}`) : q.eq("slug", key);
  const { data, error } = await q.limit(1).maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function compactPatch<T extends JsonRecord>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as Partial<T>;
}
