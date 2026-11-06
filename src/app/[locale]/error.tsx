"use client";

import { RouteState } from "@/components/route-state";

/**
 * Segment error boundary. Deliberately does not render error.message or the
 * digest: those can disclose internals, and the founder-facing rule is that we
 * never present unverified detail as explanation.
 */
export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteState
      code="ERROR"
      tone="error"
      titleAr="تعذّر إكمال هذا الطلب."
      titleEn="This request could not be completed."
      bodyAr="حدث خطأ غير متوقع أثناء تحميل الصفحة. لم يُفقد أي شيء قمت بحفظه. يمكنك المحاولة مرة أخرى، وإذا تكرر الخطأ فالمشكلة لدينا لا لديك."
      bodyEn="An unexpected error occurred while loading the page. Nothing you saved has been lost. You can try again, and if it keeps happening the problem is on our side."
    >
      <div className="rv-state-actions">
        <button type="button" onClick={reset}>
          إعادة المحاولة <span aria-hidden="true">↻</span>
        </button>
        <span lang="en" dir="ltr">Try again</span>
      </div>
    </RouteState>
  );
}
