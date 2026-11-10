export type CommunityVisibility = "public" | "discoverable_private" | "invite_only";

export type CommunityRole = "owner" | "moderator" | "member";

// Public shape. Answer keys are stored privately and never returned to clients.
export type EntryQuestion = {
  id: string;
  question: string;
  type: "text" | "choice";
  options?: string[];
};

// Owner-facing shape used when creating or editing a quiz. The answer key is sent
// to a SECURITY DEFINER RPC and is never rendered to visitors.
export type EntryQuestionInput = EntryQuestion & {
  correct_answer: string | string[];
};

export type Community = {
  id: string;
  ownerCreatorIdentityId?: string;
  name: string;
  description?: string;
  visibility: CommunityVisibility;
  guidelines?: string;
  entry_questions?: EntryQuestion[];
  createdAt: string;
};

export type CommunityMembership = {
  communityId: string;
  accountId: string;
  role: CommunityRole;
  status: "invited" | "requested" | "active" | "muted" | "suspended" | "left";
  joinedAt?: string;
};

export const VISIBILITY_LABELS: Record<CommunityVisibility, { ar: string; en: string }> = {
  public: { ar: "عام", en: "Public" },
  discoverable_private: { ar: "خاص يمكن اكتشافه", en: "Discoverable Private" },
  invite_only: { ar: "دعوة فقط", en: "Invite Only" },
};
