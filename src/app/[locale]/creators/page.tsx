import { notFound } from "next/navigation";
import Link from "next/link";

const placeholderCreators = [
  {
    id: "creator-1",
    name: { ar: "صانع إبداع", en: "Creative Creator" },
    handle: { ar: "creative_voice", en: "creative_voice" },
    bio: { ar: "مبدع متخصص في الفنون البصرية والتصوير.", en: "Artist specializing in visual arts and photography." },
    discipline: { ar: "فنون بصرية", en: "Visual Arts" },
    worksCount: 5,
  },
  {
    id: "creator-2",
    name: { ar: "مُحاضر", en: "Lecturer" },
    handle: { ar: "mind_explorer", en: "mind_explorer" },
    bio: { ar: "محاضر في مجال الفلسفة والعلوم.", en: "Lecturer in philosophy and science." },
    discipline: { ar: "علم", en: "Knowledge" },
    worksCount: 12,
  },
];

export default async function CreatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  return (
    <main className="rv-creators-page" dir={ar ? "rtl" : "ltr"}>
      <header className="rv-works-header">
        <Link className="rv-brand" href={`/${locale}`}>
          RAVINE<span>.</span>
        </Link>
        <nav>
          <Link href={`/${locale}`}>{ar ? "الرئيسية" : "Home"}</Link>
          <Link href={`/${locale}/works`}>{ar ? "الأعمال" : "Works"}</Link>
          <Link href={`/${locale}/creator`}>{ar ? "المبدع" : "Creator"}</Link>
        </nav>
      </header>

      <section className="rv-creators-hero">
        <p className="rv-kicker"><i />CREATORS</p>
        <h1>{ar ? "اكتشف المبدعين" : "Meet Creators"}</h1>
        <p>
          {ar
            ? "وراء كل عمل إنسان. اكتشف هوياتهم الإبداعية وسبل التعبير عن أنفسهم."
            : "There is a person behind every work. Discover their creative identities and expressions."}
        </p>
      </section>

      <section className="rv-creators-grid">
        <div className="rv-creators-heading">
          <div>
            <p className="rv-kicker"><i />CREATOR DISCOVERY</p>
            <h2>{ar ? "المبدعون الإبداعيون" : "Creative Creators"}</h2>
          </div>
        </div>

        <div className="rv-creator-cards">
          {placeholderCreators.map((creator) => (
            <Link key={creator.id} href={`/${locale}/creators/${creator.id}`} className="rv-creator-card">
              <div className="rv-creator-avatar">{creator.name[ar ? "ar" : "en"][0]}</div>
              <div className="rv-creator-info">
                <h3>{creator.name[ar ? "ar" : "en"]}</h3>
                <span className="rv-creator-handle">@{creator.handle[ar ? "ar" : "en"]}</span>
                <p className="rv-creator-bio">{creator.bio[ar ? "ar" : "en"]}</p>
                <div className="rv-creator-meta">
                  <span className="rv-creator-discipline">{creator.discipline[ar ? "ar" : "en"]}</span>
                  <span className="rv-creator-works">{creator.worksCount} {ar ? "عمل" : "works"}</span>
                </div>
              </div>
              <span className="rv-creator-link">↗</span>
            </Link>
          ))}
        </div>

        <div className="rv-creators-placeholder">
          <p className="rv-eyebrow">{ar ? "قريبًا" : "Coming soon"}</p>
          <p>{ar ? "واجهة اكتشاف المبدعين الكاملة ستكون متوفرة مع بنية الحسابات والهويات الإبداعية." : "Full creator discovery interface will be ready with account and creative identity infrastructure."}</p>
        </div>
      </section>

      <footer className="rv-home-footer">
        <a className="rv-brand rv-footer-brand" href={`/${locale}`}>
          RAVINE<small>THE PATH TO LIGHT</small>
        </a>
        <span>{ar ? "الكرامة · الإبداع · المعرفة · التقارب الإنساني" : "Dignity · Creativity · Knowledge · Human connection"}</span>
        <span>© RAVINE</span>
      </footer>
    </main>
  );
}