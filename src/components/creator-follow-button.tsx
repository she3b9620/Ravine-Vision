"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowCreatorAction } from "@/app/[locale]/creators/[creatorId]/actions";

type Props = {
  creatorId: string;
  locale: string;
  isAuthenticated: boolean;
  isFollowing: boolean;
};

export default function CreatorFollowButton({
  creatorId,
  locale,
  isAuthenticated,
  isFollowing: initialIsFollowing,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const ar = locale === "ar";

  const handleToggle = () => {
    if (!isAuthenticated) {
      const modalBtn = document.querySelector<HTMLButtonElement>(".rv-modal-trigger");
      if (modalBtn) {
        modalBtn.click();
      } else {
        router.push(`/${locale}/login`);
      }
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    startTransition(async () => {
      try {
        await toggleFollowCreatorAction(creatorId, locale);
      } catch {
        setIsFollowing(previousState);
      }
    });
  };

  return (
    <button
      type="button"
      className={`creator-follow-btn ${isFollowing ? "is-following" : ""}`}
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={isFollowing}
      title={
        isFollowing
          ? ar
            ? "إلغاء متابعة أعمال هذا المبدع"
            : "Unfollow this creator"
          : ar
          ? "متابعة أعمال هذا المبدع"
          : "Follow this creator"
      }
    >
      <span className="follow-symbol" aria-hidden="true">
        {isFollowing ? "✓" : "+"}
      </span>
      <span>
        {isFollowing
          ? ar
            ? "مُتابَع"
            : "Following"
          : ar
          ? "متابعة الأعمال"
          : "Follow Works"}
      </span>
    </button>
  );
}
