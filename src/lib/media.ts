export type MediaAssetKind = "video" | "audio" | "image" | "document";

export type MediaAssetState =
  | "initiated"
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed"
  | "quarantined"
  | "deleted";

export type MediaAsset = {
  id: string;
  ownerAccountId: string;
  kind: MediaAssetKind;
  state: MediaAssetState;
  providerKey?: string;
  providerAssetId?: string;
  mimeType?: string;
  byteSize?: number;
  checksum?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  createdAt: string;
};

export type MediaProviderAdapter = {
  createUploadIntent(input: {
    assetId: string;
    kind: MediaAssetKind;
    mimeType: string;
    byteSize: number;
  }): Promise<{ providerUploadId: string; uploadUrl: string }>;
  getProcessingState(providerAssetId: string): Promise<"processing" | "ready" | "failed">;
  requestDeletion(providerAssetId: string): Promise<void>;
};
