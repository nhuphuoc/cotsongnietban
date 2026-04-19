export type FeedbackType = "before_after" | "testimonial" | "comment";

export type Feedback = {
  id: string;
  type: FeedbackType;
  customer_name: string | null;
  customer_info: string | null;
  content: string | null;
  avatar_url: string | null;
  image_url_1: string | null;
  image_url_2: string | null;
  is_active: boolean;
  created_at: string;
};
