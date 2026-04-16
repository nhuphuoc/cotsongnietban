export type AdminBlogStatus = "draft" | "published";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage?: string;
  contentHtml: string;
  status: AdminBlogStatus;
  views: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

