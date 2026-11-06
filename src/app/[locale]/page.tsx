import { notFound } from "next/navigation";
import RAVINEControls from "@/components/ravine-controls";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { getAuthProviders } from "@/lib/auth-providers";
import MemberHome from "@/components/member-home";
import type { User } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const content = {
  ar: {
    nav: [["الرئيسية",""],["اكتشف","/discover"],["الأعمال","/works"],["المبدعون","/creators"],["المجتمعات","/communities"],["عن رافين","/about"]],
    greeting: "مساحة للإبداع الإنساني والمعرفة",
    title: "ما يستحق أن يُرى، يستحق أن يبقى.",
    intro: "اكتشف عوالم من الإبداع والمعرفة والتجارب الإنسانية. شاهد، تعرّف على أصحاب الأعمال، وافهم سياقها قبل أن تنضم إلى رافين.",
    explore: "ابدأ الاكتشاف",
    about: "حكاية رافين",
    featured: "مسارات تستحق الاكتشاف",
    featuredText: "لا يقتصر رافين على شكل واحد من أشكال التعبير.",
    lanes: [["السينما والصورة","أفلام، وثائقيات، وصناعة الصورة","/works","01"],["الصوت والحوار","بودكاست، حكايات، ومساحات صوتية","/discover","02"],["الفنون والتعبير","تصوير، موسيقى، وفنون بصرية","/discover","03"],["المعرفة والفكر","كتب، أبحاث، ومحاضرات وأفكار","/discover","04"]],
    works: "من عوالم رافين",
    worksText: "مساحة تتسع للأعمال والأفكار والتجارب، لا لمجرد أرقام المشاهدة.",
    all: "استكشف الأعمال",
    community: "المعنى يكبر بالمشاركة",
    communityText: "انضم إلى مجتمعات تتشكل حول الاهتمامات والأسئلة والأعمال، وتواصل مع أصحاب الرؤى.",
    communities: "اكتشف المجتمعات",
    live: "حضور حيّ، بالصوت أو بالصورة",
    liveText: "حوارات وتجارب مباشرة تتيح المشاركة وفق إعدادات كل مساحة.",
    creator: "لكل مبدع عالمه",
    creatorText: "مساحة مهنية مستقلة لإدارة الهويات والأعمال والمشروعات والفريق والمجتمع، ومتابعة فرص الاستدامة والربح بشفافية.",
    creatorCta: "ادخل مساحة المبدع",
    sign: "إنشاء حساب",
    footer: "الكرامة · الإبداع · المعرفة · التقارب الإنساني",
    sideLabel: "عالمك في رافين",
    guest: "تتصفح الآن كزائر",
    guestText: "يمكنك استكشاف رافين قبل إنشاء حساب. التفاعل الكامل يبدأ بعد التسجيل."
  },
  en: {
    nav: [["Home",""],["Discover","/discover"],["Works","/works"],["Creators","/creators"],["Communities","/communities"],["About","/about"]],
    greeting: "A space for human creativity and knowledge",
    title: "What deserves to be seen, deserves to remain.",
    intro: "Explore worlds of creativity, knowledge, and human experience. Watch, meet the people behind the work, and understand its context before joining RAVINE.",
    explore: "Start exploring",
    about: "Our story",
    featured: "Worlds worth discovering",
    featuredText: "RAVINE is not limited to a single form of expression.",
    lanes: [["Cinema & image","Films, documentaries, and the moving image","/works","01"],["Sound & conversation","Podcasts, stories, and audio spaces","/discover","02"],["Arts & expression","Photography, music, and visual arts","/discover","03"],["Knowledge & thought","Books, research, lectures, and ideas","/discover","04"]],
    works: "Across RAVINE",
    worksText: "A space for works, ideas, and experiences—not just view counts.",
    all: "Explore works",
    community: "Meaning grows through participation",
    communityText: "Join communities shaped around interests, questions, and creative work.",
    communities: "Discover communities",
    live: "Live presence, audio or video",
    liveText: "Live conversations and experiences with participation shaped by each space.",
    creator: "Every creator has a universe",
    creatorText: "A dedicated professional space to manage identities, work, projects, teams, and communities—and understand sustainable earning opportunities transparently.",
    creatorCta: "Enter Creator Space",
    sign: "Create account",
    footer: "Dignity · Creativity · Knowledge · Human connection",
    sideLabel: "Your RAVINE",
    guest: "Browsing as a guest",
    guestText: "Explore RAVINE before creating an account. Full participation begins after signup."
  }
} as const;

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();

  // The public guest experience must render even when the backend is not
  // configured or is temporarily unreachable. Only the signed-in branch needs
  // Supabase, so a missing/failed backend degrades to the guest shell instead
  // of failing the whole page (previously a hard 500).
  let user: User | null = null;
  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }
  }
  if (user) return <MemberHome locale={locale} displayName={String(user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? (locale === "ar" ? "عضو رافين" : "RAVINE member"))} email={user.email ?? ""} />;
  const t = content[locale];
  const ar = locale === "ar";
  // Only offer an identity provider that Supabase actually has enabled.
  const { google: googleEnabled } = await getAuthProviders();
  return (
    <main className={`rv-shell ${ar ? "rv-ar" : "rv-en"}`} dir={ar ? "rtl" : "ltr"}>
      <aside className="rv-sidebar">
        <a className="rv-brand" href={`/${locale}`} aria-label="RAVINE home"><span className="rv-brand-lockup"><i className="rv-brand-wordmark" role="img" aria-label="RAVINE" /><small>THE PATH TO LIGHT</small></span></a>
        <p className="rv-side-label">{t.sideLabel}</p>
        <nav className="rv-side-nav">{t.nav.map(([label, path], i) => <a className={i === 0 ? "active" : ""} href={`/${locale}${path}`} key={label}><span className="rv-nav-glyph">{["⌂","⌕","▤","✳","◉","ⓘ"][i]}</span>{label}{i === 0 ? <i /> : null}</a>)}</nav>
        <div className="rv-side-bottom"><div className="rv-guest-mark">◌</div><strong>{t.guest}</strong><p>{t.guestText}</p><a href={`/${locale}/login`}>{t.sign} ↗</a></div>
        <div className="rv-side-language"><a href={`/${ar ? "en" : "ar"}`}>{ar ? "English" : "العربية"}</a><span>© RAVINE</span></div>
      </aside>

      <div className="rv-main">
        <header className="rv-topbar">
          <span className="rv-top-context">{ar ? "عالم من الإبداع والمعرفة" : "A universe of creativity & knowledge"}</span>
          <div><a className="rv-login-link" href={`/${locale}/login`}>{ar ? "تسجيل الدخول" : "Sign in"}</a><RAVINEControls locale={locale} googleEnabled={googleEnabled}/></div>
        </header>

        <section className="rv-welcome">
          <div className="rv-welcome-copy">
            <p className="rv-kicker"><i />{t.greeting}</p>
            <h1>{t.title}</h1>
            <p className="rv-intro">{t.intro}</p>
            <div className="rv-welcome-actions"><a className="rv-action-primary" href={`/${locale}/discover`}>{t.explore}<span>↗</span></a><a className="rv-action-text" href={`/${locale}/about`}>{t.about}</a></div>
          </div>
          <div className="rv-welcome-art" aria-label={ar ? "تكوين بصري تجريدي" : "Abstract visual composition"}><div className="rv-art-glow" /><div className="rv-art-ring ring-a" /><div className="rv-art-ring ring-b" /><div className="rv-art-caption">R / 001 <span>THE PATH TO LIGHT</span></div></div>
          <span className="rv-welcome-index">01 — 04</span>
        </section>

        <section className="rv-discovery-block">
          <div className="rv-block-heading"><div><p className="rv-kicker"><i />DISCOVER YOUR NEXT WORLD</p><h2>{t.featured}</h2><p>{t.featuredText}</p></div><a href={`/${locale}/discover`}>{t.all} ↗</a></div>
          <div className="rv-world-grid">{t.lanes.map(([name, desc, path, number], i) => <a href={`/${locale}${path}`} className={`rv-world-card world-${i+1}`} key={number}><span className="rv-world-number">{number}</span><span className="rv-world-symbol">{["◒","∿","✳","⌘"][i]}</span><div><h3>{name}</h3><p>{desc}</p></div><b>↗</b></a>)}</div>
        </section>

        <section className="rv-feature-strip">
          <div className="rv-feature-visual"><span>RAVINE / WORKS</span><div className="rv-feature-orbit" /></div>
          <div className="rv-feature-copy"><p className="rv-kicker"><i />A LIVING ARCHIVE</p><h2>{t.works}</h2><p>{t.worksText}</p><a href={`/${locale}/works`}>{t.all} ↗</a></div>
        </section>

        <section className="rv-social-grid">
          <a href={`/${locale}/communities`} className="rv-social-card rv-community-card"><span>COMMUNITY / 02</span><div className="rv-social-art art-community">◎</div><h2>{t.community}</h2><p>{t.communityText}</p><b>{t.communities} ↗</b></a>
          <a href={`/${locale}/discover`} className="rv-social-card rv-live-card"><span>LIVE / 03</span><div className="rv-social-art art-live"><i /><i /><i /></div><h2>{t.live}</h2><p>{t.liveText}</p><b>{ar ? "استكشف التجارب" : "Explore experiences"} ↗</b></a>
        </section>

        <section className="rv-creator-band"><div><p className="rv-kicker"><i />CREATOR UNIVERSE</p><h2>{t.creator}</h2><p>{t.creatorText}</p><a href={`/${locale}/creator`}>{t.creatorCta} <span>↗</span></a></div><div className="rv-creator-emblem"><span>R</span><small>CREATE / EXPRESS / CONNECT</small></div></section>
        <footer className="rv-home-footer"><a className="rv-brand rv-footer-brand" href={`/${locale}`}><span className="rv-brand-lockup"><i className="rv-brand-wordmark" role="img" aria-label="RAVINE" /><small>THE PATH TO LIGHT</small></span></a><span>{t.footer}</span><span>© RAVINE</span></footer>
      </div>
    </main>
  );
}
