export type ConsentStatus = "pending" | "granted" | "withdrawn";

export type ConsentRecord = {
  id: string;
  accountId: string;
  consentType: "terms-of-service" | "privacy-policy" | "data-processing" | "marketing";
  status: ConsentStatus;
  version: string;
  timestamp: string;
};

export type DataExportRequest = {
  id: string;
  accountId: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
};

export type DataDeletionRequest = {
  id: string;
  accountId: string;
  status: "requested" | "processing" | "completed";
  requestedAt: string;
  scheduledFor: string;
};
