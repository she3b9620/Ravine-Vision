export function LoadingState({ locale }: { locale: "ar" | "en" }) {
  const ar = locale === "ar";
  return (
    <div className="rv-loading-state">
      <p>{ar ? "جاري التحميل..." : "Loading..."}</p>
    </div>
  );
}
