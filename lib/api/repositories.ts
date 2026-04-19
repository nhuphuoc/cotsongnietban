import { createAdminClient } from "@/utils/supabase/admin";

type JsonRecord = Record<string, unknown>;

const PUBLIC_COURSE_FIELDS =
  "id, category_id, title, slug, short_description, description, level_label, thumbnail_url, trailer_url, price_vnd, access_duration_days, total_duration_seconds, lesson_count, instructor_name, instructor_title, rating_avg, rating_count, is_featured, status, published_at, created_at, updated_at";
const PUBLIC_LESSON_FIELDS =
  "id, course_id, section_id, title, slug, summary, kind, duration_seconds, is_preview, is_published, sort_order";

function admin() {
  return createAdminClient();
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
    kind: lesson.kind,
    duration_seconds: lesson.duration_seconds,
    is_preview: lesson.is_preview,
    is_published: lesson.is_published,
    sort_order: lesson.sort_order,
  };
}

export async function getPublicCourseByIdentifier(identifier: string) {
  const client = admin();
  const { data: course, error } = await client
    .from("courses")
    .select(PUBLIC_COURSE_FIELDS)
    .or(`id.eq.${identifier},slug.eq.${identifier}`)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

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
  const base = client
    .from("courses")
    .select("*")
    .or(`id.eq.${identifier},slug.eq.${identifier}`)
    .limit(1)
    .maybeSingle();

  const { data: course, error } = await base;
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
  const { data: post, error } = await client
    .from("blog_posts")
    .select("*")
    .or(`id.eq.${identifier},slug.eq.${identifier}`)
    .limit(1)
    .maybeSingle();

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
  const { data, error } = await client.from("feedbacks").select("*").order("created_at", { ascending: false });
  if (error) throw error;

  const courseIds = [...new Set((data ?? []).map((item) => item.course_id).filter(Boolean))];
  const { data: courses, error: courseError } = courseIds.length
    ? await client.from("courses").select("id, title, slug").in("id", courseIds)
    : { data: [], error: null };

  if (courseError) throw courseError;
  const coursesById = new Map((courses ?? []).map((item) => [item.id, item]));

  return (data ?? []).map((item) => ({
    ...item,
    course: item.course_id ? coursesById.get(item.course_id) ?? null : null,
  }));
}

export async function getFeedbackById(id: string) {
  const client = admin();
  const { data, error } = await client.from("feedbacks").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (!data.course_id) {
    return { ...data, course: null };
  }

  const { data: course, error: courseError } = await client
    .from("courses")
    .select("id, title, slug")
    .eq("id", data.course_id)
    .maybeSingle();

  if (courseError) throw courseError;
  return { ...data, course: course ?? null };
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
      ? client.from("courses").select("id, title, slug, thumbnail_url, level_label, lesson_count").in("id", courseIds)
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
      ? client.from("courses").select("id, title, slug, thumbnail_url, level_label, lesson_count").in("id", courseIds)
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

export async function resolveCategoryId(table: "course_categories" | "blog_categories", input?: string | null) {
  if (!input) return null;
  const client = admin();
  const { data, error } = await client
    .from(table)
    .select("id")
    .or(`id.eq.${input},slug.eq.${input}`)
    .limit(1)
    .maybeSingle();

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
