/**
 * A declaration is a claim supplied by an account, not automatic proof.
 * Verification and dispute outcomes require separate evidence workflows.
 */
export type RightsDeclaration =
  | "creator-asserted"
  | "licensed"
  | "public-domain"
  | "commissioned"
  | "permission-pending"
  | "unknown";

export type RightsRecord = {
  id: string;
  workId: string;
  claimantAccountId: string;
  declaration: RightsDeclaration;
  attributionText?: string;
  licenseReference?: string;
  evidenceReferences: string[];
  reviewStatus: "unreviewed" | "under-review" | "accepted" | "disputed" | "rejected";
  createdAt: string;
};

export type RightsDispute = {
  id: string;
  workId: string;
  claimantAccountId: string;
  reason: string;
  evidenceReferences: string[];
  status: "open" | "investigating" | "resolved" | "appealed";
};
