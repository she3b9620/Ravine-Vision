export type CommunityVisibility = "public" | "discoverable-private" | "invite-only";

export type CommunityRole = "owner" | "moderator" | "member";

export type Community = {
  id: string;
  ownerCreatorIdentityId?: string;
  name: string;
  description?: string;
  visibility: CommunityVisibility;
  guidelinesVersion?: string;
  createdAt: string;
};

export type CommunityMembership = {
  communityId: string;
  accountId: string;
  role: CommunityRole;
  status: "invited" | "requested" | "active" | "muted" | "suspended" | "left";
  joinedAt?: string;
};
