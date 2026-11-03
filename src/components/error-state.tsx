import Link from "next/link";

export function ErrorState({
  locale,
  error,
  reset
}: {
  locale: "ar" | "en";
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  const ar = locale === "ar";
  return (
    <div className="rv-error-state">
      <h2>{ar ? "حدث خطأ ما" : "Something went wrong"}</h2>
      {error && <p className="rv-error-detail">{error.message}</p>}
      <div className="rv-error-actions">
        {reset && <button onClick={() => reset()}>{ar ? "إعادة المحاولة" : "Try again"}</button>}
        <Link href={`/${locale}`}>
          {ar ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
