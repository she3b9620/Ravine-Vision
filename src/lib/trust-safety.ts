export type ReportTargetType = "account" | "creator-identity" | "work" | "comment" | "community" | "message" | "live-session";

export type ReportCategory =
  | "harassment"
  | "threat"
  | "privacy"
  | "impersonation"
  | "copyright"
  | "spam"
  | "fraud"
  | "misinformation-context"
  | "other";

export type SafetyReport = {
  id: string;
  reporterAccountId: string;
  targetType: ReportTargetType;
  targetId: string;
  category: ReportCategory;
  explanation?: string;
  evidenceReferences: string[];
  status: "submitted" | "triaged" | "reviewing" | "actioned" | "dismissed" | "appealed";
  createdAt: string;
};

export type ModerationAction = {
  id: string;
  caseId: string;
  actorId: string;
  action: "no-action" | "label" | "limit-distribution" | "remove-content" | "restrict-account" | "suspend-account";
  rationale: string;
  policyVersion: string;
  appealAvailable: boolean;
  createdAt: string;
};
