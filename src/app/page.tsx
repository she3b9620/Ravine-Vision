"use client";

import { useState } from "react";

const copy = {
  ar: {
    nav: ["اكتشف", "الأعمال", "المبدعون", "عن رَافِين"],
    eyebrow: "مساحة للإبداع الإنساني والمعرفة",
    title: "كل عمل يحمل
طريقًا إلى النور.",
    description:
      "رَافِين مساحة لاكتشاف الأعمال التي تستحق الانتباه، والتعرّف على أصحابها، واستكشاف الأفكار والثقافات والتجارب التي توسّع فهمنا للعالم.",
    explore: "اكتشف رَافِين",
    about: "تعرّف على الفكرة",
    note: "الإبداع أوسع من تصنيف، والإنسان أكبر من أرقامه.",
    footer: "الطريق يبدأ بالفضول.",
    switch: "EN",
  },
  en: {
    nav: ["Discover", "作品", "Creators", "About RAVINE"],
    eyebrow: "A space for human creativity and knowledge",
    title: "Every work can
open a path to light.",
    description:
      "RAVINE is a place to discover work worth your attention, meet the people behind it, and explore the ideas, cultures, and experiences that deepen our understanding of the world.",
    explore: "Discover RAVINE",
    about: "Explore the vision",
    note: "Creativity is larger than a category. People are more than numbers.",
    footer: "Every path begins with curiosity.",
    switch: "ع",
  },
};

export default function HomePage() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const isArabic = language === "ar";
  const t = copy[language];

  return (
    <main className={isArabic ? "site arabic" : "site english"} dir={isArabic ? "rtl" : "ltr"}>
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="RAVINE home">RAVINE<span>.</span></a>
        <nav aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
          {t.nav.map((item, index) => (
            <a href={index === 3 ? "#vision" : "#discover"} key={item}>{item}</a>
          ))}
        </nav>
        <button className="language" onClick={() => setLanguage(isArabic ? "en" : "ar")} aria-label="Switch language">
          {t.switch}
        </button>
      </header>

      <section className="hero" id="discover">
        <div className="hero-copy">
          <p className="eyebrow"><span />{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="description">{t.description}</p>
          <div className="actions">
            <a className="primary" href="#vision">{t.explore}<span aria-hidden="true">↗</span></a>
            <a className="secondary" href="#vision">{t.about}</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="light-core" />
          <div className="art-caption">R / V — 001</div>
        </div>
        <p className="hero-note">{t.note}</p>
      </section>

      <section className="vision" id="vision">
        <p className="section-index">01 / THE VISION</p>
        <div>
          <h2>{isArabic ? "منصة ترى في الإبداع وسيلة للفهم والتقارب." : "A platform where creativity brings us closer to understanding."}</h2>
          <p>{isArabic
            ? "من السينما والفنون إلى العلوم والفلسفة والأدب والتجارب الإنسانية؛ رَافِين تفتح المجال لتعدد أشكال التعبير، وتحفظ قيمة العمل وسياقه وصاحبه."
            : "From cinema and the arts to science, philosophy, literature, and lived experience, RAVINE makes room for many forms of expression while respecting each work, its context, and its creator."}</p>
        </div>
      </section>

      <footer className="footer">
        <a className="wordmark" href="/">RAVINE<span>.</span></a>
        <p>{t.footer}</p>
        <span>THE PATH TO LIGHT</span>
      </footer>
    </main>
  );
}
