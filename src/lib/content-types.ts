/**
 * RAVINE's taxonomy is intentionally extensible.
 * These are discovery groupings, not a restriction on what people may express.
 */
export const workTypes = [
  "short",
  "video",
  "podcast",
  "documentary",
  "short-film",
  "feature-film",
  "series",
  "photography",
  "visual-art",
  "music",
  "writing",
  "book",
  "research",
  "lecture",
  "conversation",
  "archive",
  "other",
] as const;

export type WorkType = (typeof workTypes)[number];

export type WorkVisibility = "public" | "unlisted" | "private";

export type WorkRecord = {
  id: string;
  creatorIdentityId: string;
  title: string;
  summary?: string;
  type: WorkType;
  language?: string;
  visibility: WorkVisibility;
  publishedAt?: string;
  rightsDeclaration?: "creator-asserted" | "licensed" | "public-domain" | "unknown";
};
