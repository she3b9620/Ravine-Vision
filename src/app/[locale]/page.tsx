import { notFound } from "next/navigation";

const content = {
  ar: {
    label: "مساحة للإبداع الإنساني والمعرفة",
    title: "كل عمل يحمل طريقًا إلى النور.",
    body: "اكتشف أعمالًا تستحق الانتباه، وتعرّف على أصحابها، واستكشف الأفكار والثقافات والتجارب التي توسّع فهمنا للعالم.",
    cta: "ابدأ الاستكشاف",
    secondary: "عن رَافِين",
    sections: [
      ["الأعمال", "أفلام وفيديو وصوت وكتابة وفنون وأبحاث وأشكال أخرى من التعبير."],
      ["المبدعون", "تعرّف على أصحاب الأعمال وسياقاتهم ومساراتهم الإبداعية."],
      ["المعرفة", "مساحة للأفكار والحوار والتجارب الإنسانية وتعدد وجهات النظر."],
    ],
  },
  en: {
    label: "A space for human creativity and knowledge",
    title: "Every work can open a path to light.",
    body: "Discover work worth your attention, meet the people behind it, and explore ideas, cultures, and experiences that deepen our understanding of the world.",
    cta: "Start exploring",
    secondary: "About RAVINE",
    sections: [
      ["Works", "Film, video, audio, writing, art, research, and many other forms of expression."],
      ["Creators", "Meet the people behind the work, their context, and their creative journeys."],
      ["Knowledge", "A space for ideas, dialogue, human experience, and diverse perspectives."],
    ],
  },
} as const;

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const t = content[locale];

  return (
    <main className="localized-home">
      <header className="localized-header">
        <a className="wordmark" href={`/${locale}`}>RAVINE<span>.</span></a>
        <nav>
          <a href={`/${locale}/discover`}>{locale === "ar" ? "اكتشف" : "Discover"}</a>
          <a href={`/${locale}/works`}>{locale === "ar" ? "الأعمال" : "Works"}</a>
          <a href={`/${locale}/creators`}>{locale === "ar" ? "المبدعون" : "Creators"}</a>
        </nav>
        <a className="locale-switch" href={`/${locale === "ar" ? "en" : "ar"}`}>{locale === "ar" ? "EN" : "عربي"}</a>
      </header>
      <section className="localized-hero">
        <p className="eyebrow">{t.label}</p>
        <h1>{t.title}</h1>
        <p className="localized-description">{t.body}</p>
        <div className="localized-actions">
          <a className="primary" href={`/${locale}/discover`}>{t.cta}<span>↗</span></a>
          <a className="secondary" href={`/${locale}/about`}>{t.secondary}</a>
        </div>
      </section>
      <section className="domain-grid">
        {t.sections.map(([title, body], index) => (
          <article className="domain-card" key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <footer className="localized-footer">
        <span>RAVINE — THE PATH TO LIGHT</span>
        <span>{locale === "ar" ? "الطريق يبدأ بالفضول." : "Every path begins with curiosity."}</span>
      </footer>
    </main>
  );
}
