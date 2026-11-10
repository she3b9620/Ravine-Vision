/**
 * Bilingual labels for database enum values.
 *
 * The database stores stable English tokens. Nothing user-facing should render
 * them raw: an Arabic page that prints "under_review" or "creator_asserted" is a
 * defect, and the same token can mean different things in different tables, so
 * each family gets its own map.
 *
 * Keep these maps in sync with the CHECK constraints and enum types in
 * `supabase/migrations`. `labels.test.ts` fails when a known token is missing.
 */

export type Locale = "ar" | "en";
export type BilingualLabel = { ar: string; en: string };
export type LabelMap = Record<string, BilingualLabel>;

export const WORK_VISIBILITY_LABELS: LabelMap = {
  public: { ar: "عام", en: "Public" },
  unlisted: { ar: "غير مدرج", en: "Unlisted" },
  private: { ar: "خاص", en: "Private" },
};

export const WORK_KIND_LABELS: LabelMap = {
  short: { ar: "عمل قصير", en: "Short" },
  video: { ar: "فيديو", en: "Video" },
  podcast: { ar: "بودكاست", en: "Podcast" },
  documentary: { ar: "وثائقي", en: "Documentary" },
  short_film: { ar: "فيلم قصير", en: "Short film" },
  feature_film: { ar: "فيلم روائي", en: "Feature film" },
  series: { ar: "مسلسل", en: "Series" },
  photography: { ar: "تصوير", en: "Photography" },
  visual_art: { ar: "فنون بصرية", en: "Visual art" },
  music: { ar: "موسيقى", en: "Music" },
  writing: { ar: "كتابة", en: "Writing" },
  book: { ar: "كتاب", en: "Book" },
  research: { ar: "بحث", en: "Research" },
  lecture: { ar: "محاضرة", en: "Lecture" },
  conversation: { ar: "حوار", en: "Conversation" },
  archive: { ar: "أرشيف", en: "Archive" },
  other: { ar: "أخرى", en: "Other" },
};

export const RIGHTS_DECLARATION_LABELS: LabelMap = {
  creator_asserted: { ar: "أمتلك العمل / أملك حقوقه", en: "Creator-asserted ownership" },
  licensed: { ar: "مرخّص لي استخدامه", en: "Licensed to me" },
  public_domain: { ar: "ضمن الملكية العامة", en: "Public domain" },
  commissioned: { ar: "عمل بتكليف أو عقد", en: "Commissioned work" },
  permission_pending: { ar: "الإذن قيد الانتظار", en: "Permission pending" },
  unknown: { ar: "لا أستطيع تأكيد الحالة بعد", en: "Not confirmed yet" },
};

export const RIGHTS_REVIEW_STATUS_LABELS: LabelMap = {
  unreviewed: { ar: "بانتظار المراجعة", en: "Unreviewed" },
  under_review: { ar: "قيد المراجعة", en: "Under review" },
  accepted: { ar: "مقبول", en: "Accepted" },
  disputed: { ar: "معترض عليه", en: "Disputed" },
  rejected: { ar: "مرفوض", en: "Rejected" },
};

export const TIER_LABELS: LabelMap = {
  viewer: { ar: "مشاهد", en: "Viewer" },
  creator: { ar: "مبدع", en: "Creator" },
  verified: { ar: "مبدع موثّق", en: "Verified creator" },
  select: { ar: "Select", en: "Select" },
};

export const TIER_REQUEST_STATUS_LABELS: LabelMap = {
  submitted: { ar: "مُقدَّم", en: "Submitted" },
  under_review: { ar: "قيد المراجعة", en: "Under review" },
  approved: { ar: "مقبول", en: "Approved" },
  rejected: { ar: "مرفوض", en: "Rejected" },
  withdrawn: { ar: "مسحوب", en: "Withdrawn" },
};

export const REPORT_TARGET_LABELS: LabelMap = {
  account: { ar: "حساب", en: "Account" },
  creator_identity: { ar: "هوية إبداعية", en: "Creative identity" },
  work: { ar: "عمل", en: "Work" },
  comment: { ar: "تعليق", en: "Comment" },
  community: { ar: "مجتمع", en: "Community" },
  message: { ar: "رسالة", en: "Message" },
  live_session: { ar: "بث مباشر", en: "Live session" },
};

export const REPORT_CATEGORY_LABELS: LabelMap = {
  harassment: { ar: "تحرّش أو إساءة", en: "Harassment" },
  threat: { ar: "تهديد", en: "Threat" },
  privacy: { ar: "انتهاك خصوصية", en: "Privacy violation" },
  impersonation: { ar: "انتحال شخصية", en: "Impersonation" },
  copyright: { ar: "حقوق نشر", en: "Copyright" },
  spam: { ar: "إزعاج أو سبام", en: "Spam" },
  fraud: { ar: "احتيال", en: "Fraud" },
  misinformation_context: { ar: "تضليل أو نقص سياق", en: "Misleading context" },
  other: { ar: "أخرى", en: "Other" },
};

export const CASE_STATUS_LABELS: LabelMap = {
  submitted: { ar: "مُقدَّم", en: "Submitted" },
  triaged: { ar: "قيد الفرز", en: "Triaged" },
  reviewing: { ar: "قيد الفحص", en: "Reviewing" },
  actioned: { ar: "تم اتخاذ إجراء", en: "Actioned" },
  dismissed: { ar: "مغلق", en: "Dismissed" },
  appealed: { ar: "مستأنف", en: "Appealed" },
};

export const DISCIPLINE_LABELS: LabelMap = {
  cinema: { ar: "السينما", en: "Cinema" },
  video: { ar: "الفيديو", en: "Video" },
  photography: { ar: "التصوير", en: "Photography" },
  music: { ar: "الموسيقى", en: "Music" },
  writing: { ar: "الكتابة", en: "Writing" },
  research: { ar: "البحث", en: "Research" },
  visual_art: { ar: "الفنون البصرية", en: "Visual arts" },
  education: { ar: "التعليم", en: "Education" },
  culture: { ar: "الثقافة", en: "Culture" },
  other: { ar: "أخرى", en: "Other" },
};

/**
 * Returns the label for `value`, falling back to a readable version of the token
 * itself so an unexpected database value never renders as a blank.
 */
export function labelFor(map: LabelMap, value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const label = map[value];
  if (label) return locale === "ar" ? label.ar : label.en;
  return value.replaceAll("_", " ");
}
