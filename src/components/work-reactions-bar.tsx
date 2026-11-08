"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleWorkReaction, type ReactionKind } from "@/app/[locale]/works/[workId]/actions";

type ReactionsBarProps = {
  workId: string;
  locale: string;
  userReaction: ReactionKind | null;
  counts: {
    appreciate: number;
    thoughtful: number;
    inspiring: number;
  };
  isAuthenticated: boolean;
};

export default function WorkReactionsBar({
  workId,
  locale,
  userReaction: initialUserReaction,
  counts: initialCounts,
  isAuthenticated,
}: ReactionsBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentReaction, setCurrentReaction] = useState<ReactionKind | null>(initialUserReaction);
  const [counts, setCounts] = useState(initialCounts);
  const ar = locale === "ar";

  const handleReactionClick = (kind: ReactionKind) => {
    if (!isAuthenticated) {
      const modalBtn = document.querySelector<HTMLButtonElement>(".rv-modal-trigger");
      if (modalBtn) {
        modalBtn.click();
      } else {
        router.push(`/${locale}/login`);
      }
      return;
    }

    const previousReaction = currentReaction;
    const previousCounts = { ...counts };

    // Optimistic update
    const nextCounts = { ...counts };
    let nextReaction: ReactionKind | null = null;

    if (previousReaction === kind) {
      // Toggle off
      nextCounts[kind] = Math.max(0, nextCounts[kind] - 1);
      nextReaction = null;
    } else {
      // If had previous, decrement previous
      if (previousReaction) {
        nextCounts[previousReaction] = Math.max(0, nextCounts[previousReaction] - 1);
      }
      nextCounts[kind] = (nextCounts[kind] || 0) + 1;
      nextReaction = kind;
    }

    setCurrentReaction(nextReaction);
    setCounts(nextCounts);

    startTransition(async () => {
      try {
        await toggleWorkReaction(workId, kind, locale);
      } catch {
        // Rollback on failure
        setCurrentReaction(previousReaction);
        setCounts(previousCounts);
      }
    });
  };

  const reactionMeta = [
    {
      key: "appreciate" as const,
      symbol: "✦",
      labelAr: "تقدير",
      labelEn: "Appreciate",
    },
    {
      key: "thoughtful" as const,
      symbol: "◈",
      labelAr: "تأمّل وعُمق",
      labelEn: "Thoughtful",
    },
    {
      key: "inspiring" as const,
      symbol: "❖",
      labelAr: "إلهام",
      labelEn: "Inspiring",
    },
  ];

  return (
    <section className="work-reactions-wrapper" aria-label={ar ? "تفاعلات العمل" : "Work reactions"}>
      <div className="work-reactions-header">
        <p className="work-reactions-note">
          {ar
            ? "التفاعل في رافين تعبيرٌ نوعي عن الأثر والقيمة، وليس سباق أرقام."
            : "Reactions on RAVINE reflect artistic impact and depth, not vanity numbers."}
        </p>
      </div>
      <div className="work-reactions-buttons" role="group">
        {reactionMeta.map(({ key, symbol, labelAr, labelEn }) => {
          const isActive = currentReaction === key;
          const count = counts[key] || 0;
          const label = ar ? labelAr : labelEn;

          return (
            <button
              key={key}
              type="button"
              className={`work-reaction-btn ${isActive ? "is-active" : ""}`}
              onClick={() => handleReactionClick(key)}
              disabled={isPending}
              aria-pressed={isActive}
              title={label}
            >
              <span className="reaction-symbol" aria-hidden="true">{symbol}</span>
              <span className="reaction-label">{label}</span>
              {count > 0 && <span className="reaction-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
