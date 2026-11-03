import Link from "next/link";

type SectionPlaceholderProps = {
  locale: "ar" | "en";
  code: string;
  title: string;
  description: string;
};

export function SectionPlaceholder({
  locale,
  code,
  title,
  description,
}: SectionPlaceholderProps) {
  const ar = locale === "ar";
  return (
    <main className="simple-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}`}>
        {ar ? "← الرئيسية" : "← Home"}
      </Link>
      <p className="eyebrow">RAVINE / {code}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <span className="coming-note">
        {ar ? "مرحلة التأسيس — قيد البناء" : "Foundation phase — in progress"}
      </span>
    </main>
  );
}
