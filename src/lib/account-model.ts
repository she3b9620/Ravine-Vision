/**
 * One person/account may manage multiple creative identities.
 * These types describe product concepts only; they do not grant permissions.
 * All authorization must eventually be enforced server-side.
 */
export type AccountState = "guest" | "viewer" | "creator" | "verified" | "select";

export type PersonalAccount = {
  id: string;
  displayName: string;
  preferredLanguage: "ar" | "en" | string;
  state: AccountState;
};

export type CreatorIdentity = {
  id: string;
  accountId: string;
  publicName: string;
  biography?: string;
  disciplines: string[];
  status: "draft" | "active" | "under-review" | "suspended";
};

export type CreatorWorkspace = {
  id: string;
  creatorIdentityIds: string[];
  teamMemberIds: string[];
};
