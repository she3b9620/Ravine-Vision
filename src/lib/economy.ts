/**
 * Domain contracts only. No balance, price, fee, eligibility, or payout rule
 * is activated by these types.
 */
export type Money = {
  amountMinor: number;
  currency: string;
};

export type LedgerEntryType =
  | "earning"
  | "platform-fee"
  | "refund"
  | "chargeback"
  | "adjustment"
  | "payout"
  | "reversal";

export type LedgerEntry = {
  id: string;
  accountId: string;
  creatorIdentityId?: string;
  sourceReference: string;
  type: LedgerEntryType;
  amount: Money;
  direction: "credit" | "debit";
  status: "pending" | "available" | "held" | "reversed";
  idempotencyKey: string;
  createdAt: string;
};

export type PayoutRecord = {
  id: string;
  payeeAccountId: string;
  amount: Money;
  status: "not-requested" | "requested" | "under-review" | "processing" | "paid" | "failed" | "cancelled";
  providerReference?: string;
  createdAt: string;
};
