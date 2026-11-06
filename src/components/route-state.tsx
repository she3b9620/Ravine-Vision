import Link from "next/link";

/**
 * Shared branded state screen for 404 / error / loading boundaries.
 *
 * The locale is not available to `not-found.tsx` (Next does not pass params to
 * it), so these screens are intentionally bilingual rather than guessing a
 * language. Arabic comes first, matching the document direction.
 */
export function RouteState({
  code,
  titleAr,
  titleEn,
  bodyAr,
  bodyEn,
  tone = "notice",
  children,
}: {
  code: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  tone?: "notice" | "error" | "loading";
  children?: React.ReactNode;
}) {
  return (
    <main className={`rv-state rv-state-${tone}`} dir="rtl">
      <div className="rv-state-inner">
        <p className="rv-state-kicker">
          <i />
          RAVINE / {code}
        </p>
        <h1 lang="ar">{titleAr}</h1>
        <p className="rv-state-title-en" lang="en" dir="ltr">
          {titleEn}
        </p>
        <p className="rv-state-body" lang="ar">
          {bodyAr}
        </p>
        <p className="rv-state-body rv-state-body-en" lang="en" dir="ltr">
          {bodyEn}
        </p>
        {children}
        <nav className="rv-state-links" aria-label="RAVINE">
          <Link href="/ar">العربية <span aria-hidden="true">↗</span></Link>
          <Link href="/en" lang="en" dir="ltr">English <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </main>
  );
}
