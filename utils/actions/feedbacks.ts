import { createClient } from "@/utils/supabase/server";
import type { Feedback, FeedbackType } from "@/types/feedback";

/**
 * Server-side utility: fetch all active feedbacks filtered by type,
 * ordered newest-first.
 */
export async function getFeedbacksByType(type: FeedbackType): Promise<Feedback[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("feedbacks")
    .select("id, type, customer_name, customer_info, content, avatar_url, image_url_1, image_url_2, is_active, created_at")
    .eq("type", type)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Feedback[];
}
