import { notFound } from "next/navigation";

const copy = {
  ar: {
    nav: ["اكتشف", "الأعمال", "المبدعون", "المجتمعات", "عن رافين"],
    eyebrow: "مساحة للإبداع الإنساني والمعرفة",
    title: "ما يستحق أن يُرى،\nيستحق أن يبقى.",
    body: "شاهد عيّنة من الأعمال، تعرّف على المبدعين، وافهم فكرة رَافِين قبل ما تسجّل. التفاعل الكامل يبدأ بعد إنشاء حسابك.",
    explore: "اكتشف الأعمال",
    story: "حكاية رافين",
    featured: "اختيارات تستحق المشاهدة",
    featuredSub: "أعمال وأفكار تترك أثرًا يتجاوز لحظة المشاهدة.",
    categories: "عوالم تستحق الاكتشاف",
    categoriesSub: "السينما ليست حدود المحتوى؛ إنها إحدى طرق رؤيته.",
    creators: "وراء كل عمل إنسان ورؤية.",
    creatorBody: "تعرّف على أصحاب الأعمال وسياقاتهم ومساراتهم الإبداعية.",
    creatorCta: "اكتشف المبدعين",
    space: "مساحتك الإبداعية تبدأ هنا.",
    spaceBody: "مساحة مستقلة لإدارة هوياتك وأعمالك ومجتمعك ومشروعاتك، ومتابعة أثر عملك وفرص تحقيق الدخل منه بشفافية.",
    spaceCta: "مساحة المبدع",
    categoriesList: [["السينما والأفلام","أفلام قصيرة وطويلة ووثائقيات"],["الصوت والحكايات","بودكاست وحوارات وتجارب صوتية"],["الفنون والإبداع","تصوير وفنون بصرية وموسيقى"],["المعرفة والفكر","كتب وأبحاث ومحاضرات وأفكار"]],
    works: [["ما وراء الصورة","فيلم وثائقي · 18 دقيقة","photo-1478720568477-152d9b164e26"],["أطراف الحكاية","فيلم قصير · 12 دقيقة","photo-1519608487953-e999c86e7455"],["مساحة للتأمل","فيديو · 09 دقائق","photo-1500530855697-b586d89ee3"],["صوت وتجربة","بودكاست · حلقة 04","photo-1516280440614-37939bbacd81"]],
  },
  en: {
    nav: ["Discover", "Works", "Creators", "Communities", "About"],
    eyebrow: "A space for human creativity and knowledge",
    title: "What deserves to be seen\ndeserves to remain.",
    body: "Preview the work, meet the creators, and understand RAVINE before you join. Full participation begins when you create an account.",
    explore: "Explore the work",
    story: "Our story",
    featured: "Selected to be experienced",
    featuredSub: "Work and ideas that leave something beyond the moment.",
    categories: "Worlds worth discovering",
    categoriesSub: "Cinema is not the boundary of content; it is one way of seeing.",
    creators: "Behind every work, a human vision.",
    creatorBody: "Meet the people behind the work, their context, and their creative journeys.",
    creatorCta: "Discover creators",
    space: "Your creative space starts here.",
    spaceBody: "A dedicated space to manage your identities, work, community, and projects—and understand your impact and earning opportunities transparently.",
    spaceCta: "Creator space",
    categoriesList: [["Film & cinema","Short films, features, and documentaries"],["Sound & stories","Podcasts, conversations, and audio"],["Arts & expression","Photography, visual arts, and music"],["Knowledge & thought","Books, research, lectures, and ideas"]],
    works: [["Beyond the Frame","Documentary · 18 min","photo-1478720568477-152d9b164e26"],["Edges of a Story","Short film · 12 min","photo-1519608487953-e999c86e7455"],["Room to Reflect","Video · 09 min","photo-1500530855697-b586d89ba3ee"],["Sound & Experience","Podcast · Episode 04","photo-1516280440614-37939bbacd81"]],
  },
} as const;

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const t = copy[locale];
  const ar = locale === "ar";
  return (
    <main className={`ravine-home ${ar ? "is-ar" : "is-en"}`} dir={ar ? "rtl" : "ltr"}>
      <header className="rv-header">
        <a className="rv-logo" href={`/${locale}`}>RAVINE<span>.</span></a>
        <nav>{t.nav.map((item, i) => <a key={item} href={[`/${locale}/discover`,`/${locale}/works`,`/${locale}/creators`,`/${locale}/communities`,`/${locale}/about`][i]}>{item}</a>)}</nav>
        <div className="rv-head-actions"><a className="rv-lang" href={`/${ar ? "en" : "ar"}`}>{ar ? "EN" : "عربي"}</a><a className="rv-join" href={`/${locale}/login`}>{ar ? "ابدأ رحلتك" : "Join RAVINE"}</a></div>
      </header>
      <section className="rv-hero">
        <div className="rv-hero-image" aria-hidden="true" />
        <div className="rv-hero-copy">
          <p className="rv-eyebrow"><i />{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="rv-lead">{t.body}</p>
          <div className="rv-actions"><a className="rv-primary" href={`/${locale}/discover`}>{t.explore}<span>↗</span></a><a className="rv-secondary" href={`/${locale}/about`}>{t.story}</a></div>
        </div>
        <span className="rv-hero-index">01 / THE PATH TO LIGHT</span>
      </section>
      <section className="rv-section">
        <div className="rv-section-head"><div><p className="rv-eyebrow"><i />RAVINE PICKS</p><h2>{t.featured}</h2><p>{t.featuredSub}</p></div><a href={`/${locale}/works`}>{ar ? "كل الأعمال ↗" : "All works ↗"}</a></div>
        <div className="rv-work-grid">{t.works.map(([name, meta, image]) => <a className="rv-work" href={`/${locale}/works`} key={name}><div className="rv-poster" style={{backgroundImage:`url(https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85)`}}><span>▶</span></div><h3>{name}</h3><small>{meta}</small></a>)}</div>
      </section>
      <section className="rv-category-section"><div className="rv-section-head"><div><p className="rv-eyebrow"><i />EXPLORE BEYOND</p><h2>{t.categories}</h2><p>{t.categoriesSub}</p></div></div><div className="rv-category-grid">{t.categoriesList.map(([name, desc], i)=><a className="rv-category" href={`/${locale}/discover`} key={name}><span>0{i+1}</span><h3>{name}</h3><p>{desc}</p><b>↗</b></a>)}</div></section>
      <section className="rv-creators"><div><p className="rv-eyebrow"><i />THE PEOPLE BEHIND THE WORK</p><h2>{t.creators}</h2><p>{t.creatorBody}</p><a className="rv-secondary" href={`/${locale}/creators`}>{t.creatorCta} ↗</a></div><div className="rv-creator-image" /></section>
      <section className="rv-studio"><div><p className="rv-eyebrow"><i />FOR CREATORS</p><h2>{t.space}</h2><p>{t.spaceBody}</p><a className="rv-primary" href={`/${locale}/creator`}>{t.spaceCta}<span>↗</span></a></div><div className="rv-studio-art"><span>CREATOR<br/>UNIVERSE</span></div></section>
      <footer className="rv-footer"><a className="rv-logo" href={`/${locale}`}>RAVINE<span>.</span></a><span>THE PATH TO LIGHT</span><span>{ar ? "الكرامة · الإبداع · المعرفة · التقارب الإنساني" : "Dignity · Creativity · Knowledge · Human connection"}</span></footer>
    </main>
  );
}
