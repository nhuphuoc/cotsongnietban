export type AdminFeedbackStatus = "new" | "reviewed" | "pinned" | "hidden";

export type AdminFeedbackSource = "website" | "zalo" | "facebook";

export type AdminFeedback = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  source: AdminFeedbackSource;
  rating: 1 | 2 | 3 | 4 | 5;
  messageHtml: string;
  course?: string;
  status: AdminFeedbackStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  internalNoteHtml?: string;
};

