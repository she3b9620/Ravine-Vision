import { notFound } from "next/navigation";
import RAVINEControls from "@/components/ravine-controls";
import RAVINEOpenAuth from "@/components/open-auth-link";
import GuestHeroShowcase from "@/components/guest-hero-showcase";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { getAuthProviders } from "@/lib/auth-providers";
import MemberHome from "@/components/member-home";
import { resolveDisplayName } from "@/lib/display-name";
import type { User } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const content = {
  ar: {
    nav: [["الرئيسية",""],["اكتشف","/discover"],["الأعمال","/works"],["المبدعون","/creators"],["المجتمعات","/communities"],["عن رافين","/about"]],
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
    creator: "لكل صاحب رؤية أو تجربة أو عمل إبداعي",
    creatorText: "مساحة مهنية لإدارة أعمالك، بناء هويتك، والتواصل مع جمهور يقدر ما تقدمه.",
    creatorCta: "مساحة المبدع",
    footer: "الكرامة · الإبداع · المعرفة · التقارب الإنساني",
    sideLabel: "المسارات",
    guest: "حساب زائر",
    guestText: "تصفح بحرية. أنشئ حسابًا عندما تود المشاركة والحفظ.",
    sign: "تسجيل الدخول",
  },
  en: {
    nav: [["Home",""],["Discover","/discover"],["Works","/works"],["Creators","/creators"],["Communities","/communities"],["About","/about"]],
    featured: "Paths worth discovering",
    featuredText: "RAVINE does not reduce human expression to a single medium.",
    lanes: [["Cinema & Image","Film, documentary, and visual storytelling","/works","01"],["Audio & Dialogue","Podcasts, oral histories, and audio spaces","/discover","02"],["Arts & Expression","Photography, music, and visual arts","/discover","03"],["Knowledge & Thought","Books, research, lectures, and ideas","/discover","04"]],
    works: "From the RAVINE universes",
    worksText: "A home for works, ideas, and human experiences—not just view counts.",
    all: "Explore works",
    community: "Meaning deepens through connection",
    communityText: "Join communities formed around shared questions, arts, and works. Connect with the voices behind them.",
    communities: "Discover communities",
    live: "Live presence, audio or visual",
    liveText: "Real-time conversations and experiences shaped by each space's terms.",
    creator: "For every vision, story, or body of creative work",
    creatorText: "A professional space to steward your works, shape your identity, and connect with an audience that values depth.",
    creatorCta: "Creator space",
    footer: "Dignity · Creativity · Knowledge · Human connection",
    sideLabel: "EXPLORE",
    guest: "Guest preview",
    guestText: "Browse freely. Create an account whenever you want to save, respond, and connect.",
    sign: "Sign in",
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") {
    notFound();
  }
  let user: User | null = null;
  let displayName = "";
  let accountTier = "viewer";
  const env = getSupabaseEnvironment();
  if (env) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name,account_tier")
          .eq("id", user.id)
          .maybeSingle();
        displayName =
          profile?.display_name?.trim() ||
          resolveDisplayName(user.user_metadata) ||
          user.email?.split("@")[0] ||
          (locale === "ar" ? "عضو رافين" : "RAVINE member");
        if (profile?.account_tier) accountTier = profile.account_tier;
      }
    } catch {
      user = null;
    }
  }
  if (user) return <MemberHome locale={locale} displayName={displayName} email={user.email ?? ""} accountTier={accountTier} />;
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
        <div className="rv-side-bottom"><div className="rv-guest-mark">◌</div><strong>{t.guest}</strong><p>{t.guestText}</p><RAVINEOpenAuth>{t.sign} ↗</RAVINEOpenAuth></div>
        <div className="rv-side-language"><a href={`/${ar ? "en" : "ar"}`}>{ar ? "English" : "العربية"}</a><span>© RAVINE</span></div>
      </aside>

      <div className="rv-main">
        <header className="rv-topbar">
          <span className="rv-top-context">{ar ? "عالم من الإبداع والمعرفة" : "A universe of creativity & knowledge"}</span>
          <div><RAVINEOpenAuth className="rv-login-link">{ar ? "تسجيل الدخول" : "Sign in"}</RAVINEOpenAuth><RAVINEControls locale={locale} googleEnabled={googleEnabled}/></div>
        </header>

        <GuestHeroShowcase locale={locale} />

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
