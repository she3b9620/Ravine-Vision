import { notFound } from "next/navigation";
import Link from "next/link";

const worldCategories = [
  { id: "cinema", ar: "السينما والصورة", en: "Cinema & Image" },
  { id: "audio", ar: "الصوت والحوار", en: "Sound & Dialogue" },
  { id: "arts", ar: "الفنون", en: "Arts" },
  { id: "knowledge", ar: "المعرفة والفكر", en: "Knowledge" },
  { id: "human", ar: "التجارب الإنسانية", en: "Human Experience" },
];

const placeholderWorks = [
  {
    id: "1",
    title: { ar: "حكاية سينمائية", en: "Cinematic Story" },
    creator: { ar: "مبدع غير محدد", en: "Unspecified Creator" },
  },
  {
    id: "2",
    title: { ar: "حوار مع فنان", en: "Conversation with an Artist" },
    creator: { ar: "مبدع غير محدد", en: "Unspecified Creator" },
  },
];

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  return (
    <main className="rv-works-page" dir={ar ? "rtl" : "ltr"}>
      <header className="rv-works-header">
        <Link className="rv-brand" href={`/${locale}`}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>
          <Link href={`/${locale}`}>{ar ? "الرئيسية" : "Home"}</Link>
          <Link href={`/${locale}/discover`}>{ar ? "اكتشف" : "Discover"}</Link>
          <Link href={`/${locale}/creator`}>{ar ? "المبدع" : "Creator"}</Link>
        </nav>
      </header>

      <section className="rv-works-hero">
        <p className="rv-kicker"><i />WORKS</p>
        <h1>{ar ? "عوالم رافين" : "RAVINE Worlds"}</h1>
        <p>
          {ar
            ? "مساحة للأفلام والفيديو والصوت والكتابة والفنون والأبحاث والأرشيف وسائر أشكال التعبير."
            : "A home for film, video, audio, writing, arts, research, archives, and many other forms of expression."}
        </p>
      </section>

      <section className="rv-works-catalog">
        <div className="rv-works-heading">
          <div>
            <p className="rv-kicker"><i />EXPLORE BY CATEGORY</p>
            <h2>{ar ? "تصنيفات رافين" : "RAVINE Categories"}</h2>
          </div>
          <Link href={`/${locale}/discover`}>{ar ? "اكتشف المزيد →" : "Discover more →"}</Link>
        </div>

        <div className="rv-category-grid">
          {worldCategories.map((cat) => (
            <a key={cat.id} href={`/${locale}/discover?category=${cat.id}`} className="rv-category-card">
              <span className="rv-category-label">{ar ? "رافين / " : "R / "}{cat.id.toUpperCase()}</span>
              <h3>{ar ? cat.ar : cat.en}</h3>
            </a>
          ))}
        </div>

        <div className="rv-works-preview">
          <p className="rv-kicker"><i />EXAMPLE WORKS</p>
          <h2>{ar ? "أمثلة على الأعمال" : "Sample Works"}</h2>
          <div className="rv-work-grid">
            {placeholderWorks.map((work) => (
              <article key={work.id} className="rv-work-card">
                <span className="rv-example-badge">{ar ? "مثال توضيحي" : "Example"}</span>
                <div className="rv-work-poster">{work.title[ar ? "ar" : "en"]}</div>
                <div className="rv-work-info">
                  <h3>{work.title[ar ? "ar" : "en"]}</h3>
                  <p className="rv-work-creator">{work.creator[ar ? "ar" : "en"]}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="rv-works-note">
            {ar
              ? "هذه نتاجات مؤقتة للعرض. سيتم استكمال بنية الأعمال مع وجود قاعدة البيانات."
              : "These are placeholder results for display. Full works infrastructure awaits database integration."}
          </p>
        </div>
      </section>

      <footer className="rv-home-footer">
        <a className="rv-brand rv-footer-brand" href={`/${locale}`}>
          <span className="rv-brand-lockup"><i className="rv-brand-wordmark" role="img" aria-label="RAVINE" /><small>THE PATH TO LIGHT</small></span>
        </a>
        <span>{ar ? "الكرامة · الإبداع · المعرفة · التقارب الإنساني" : "Dignity · Creativity · Knowledge · Human connection"}</span>
        <span>© RAVINE</span>
      </footer>
    </main>
  );
}