import { notFound } from "next/navigation";

export default async function DiscoverPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  return (
    <main className="simple-page" dir={ar ? "rtl" : "ltr"}>
      <a className="back-link" href={`/${locale}`}>{ar ? "← الرئيسية" : "← Home"}</a>
      <p className="eyebrow">RAVINE / DISCOVER</p>
      <h1>{ar ? "اكتشف ما يستحق انتباهك." : "Discover what deserves your attention."}</h1>
      <p>{ar ? "ستُبنى هنا تجربة اكتشاف متعددة الأشكال، تراعي السياق والجودة والتنوع، لا مجرد أرقام التفاعل." : "A multidimensional discovery experience will live here, guided by context, quality, and diversity—not engagement numbers alone."}</p>
      <span className="coming-note">{ar ? "مرحلة التأسيس — قيد البناء" : "Foundation phase — in progress"}</span>
    </main>
  );
}
