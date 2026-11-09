"use client";

import { useTransition } from "react";
import RAVINEOpenAuth from "@/components/open-auth-link";
import {
  joinCommunityAction,
  leaveCommunityAction,
} from "@/app/[locale]/communities/[communityId]/actions";

type Props = {
  communityId: string;
  locale: string;
  isAuthenticated: boolean;
  membershipStatus: string | null;
};

export default function CommunityMembershipButton({
  communityId,
  locale,
  isAuthenticated,
  membershipStatus,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const ar = locale === "ar";

  if (!isAuthenticated) {
    return (
      <div className="community-guest-join">
        <RAVINEOpenAuth className="action-button-accent">
          {ar ? "تسجيل الدخول لطلب الانضمام والمشاركة ↗" : "Sign in to request membership ↗"}
        </RAVINEOpenAuth>
      </div>
    );
  }

  const handleJoin = (formData: FormData) => {
    startTransition(async () => {
      await joinCommunityAction(formData);
    });
  };

  const handleLeave = (formData: FormData) => {
    startTransition(async () => {
      await leaveCommunityAction(formData);
    });
  };

  if (membershipStatus === "active") {
    return (
      <div className="community-membership-active-bar">
        <span className="community-member-badge">
          {ar ? "✓ أنت عضو نشط في هذا المجتمع" : "✓ You are an active member"}
        </span>
        <form action={handleLeave} style={{ display: "inline" }}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="community_id" value={communityId} />
          <button
            type="submit"
            className="community-leave-button"
            disabled={isPending}
          >
            {isPending
              ? ar
                ? "جارٍ المعالجة..."
                : "Processing..."
              : ar
              ? "مغادرة المجتمع"
              : "Leave community"}
          </button>
        </form>
      </div>
    );
  }

  if (membershipStatus === "requested") {
    return (
      <div className="community-membership-active-bar">
        <span className="community-member-badge">
          {ar ? "◷ طلب الانضمام قيد المراجعة" : "◷ Membership request pending"}
        </span>
        <form action={handleLeave} style={{ display: "inline" }}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="community_id" value={communityId} />
          <button
            type="submit"
            className="community-leave-button"
            disabled={isPending}
          >
            {isPending
              ? ar
                ? "جارٍ المعالجة..."
                : "Processing..."
              : ar
              ? "سحب الطلب"
              : "Withdraw request"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={handleJoin}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="community_id" value={communityId} />
      <button
        type="submit"
        className="action-button-accent"
        disabled={isPending}
      >
        {isPending
          ? ar
            ? "جارٍ إرسال الطلب..."
            : "Sending request..."
          : ar
          ? "طلب الانضمام إلى المجتمع ↗"
          : "Request to join ↗"}
      </button>
    </form>
  );
}
