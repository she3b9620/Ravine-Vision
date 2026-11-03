import { notFound } from "next/navigation";
import Link from "next/link";

interface Community {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  visibility: "public" | "invite-only";
  membersCount: number;
  owner: { ar: string; en: string };
}

const placeholderCommunities: Community[] = [
  {
    id: "com-1",
    name: { ar: "مجتمع السينما البشرية", en: "Human Cinema Community" },
    description: { ar: "نقاش عن الأعمال السينمائية التي تعكس التجارب الإنسانية.", en: "Discussing films that reflect human experiences." },
    visibility: "public",
    membersCount: 42,
    owner: { ar: "مبدع غير محدد", en: "Unspecified Creator" },
  },
  {
    id: "com-2",
    name: { ar: "مجتمع الفنون المعاصرة", en: "Contemporary Arts Community" },
    description: { ar: "مجموعة للمصورين والرسامين والمصممين.", en: "A group for photographers, painters, and designers." },
    visibility: "public",
    membersCount: 28,
    owner: { ar: "مبدع غير محدد", en: "Unspecified Creator" },
  },
];

export default async function CommunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  return (
    <main className="rv-communities-page" dir={ar ? "rtl" : "ltr"}>
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

      <section className="rv-communities-hero">
        <p className="rv-kicker"><i />COMMUNITIES</p>
        <h1>{ar ? "مجتمعات رافين" : "RAVINE Communities"}</h1>
        <p>
          {ar
            ? "مجتمعات حول الاهتمامات والأعمال والمبدعين، مع مستويات خصوصية وإدارة واضحة."
            : "Communities around interests, works, and creators, with clear privacy levels and management."}
        </p>
      </section>

      <section className="rv-communities-list">
        <div className="rv-communities-heading">
          <div>
            <p className="rv-kicker"><i />PUBLIC COMMUNITIES</p>
            <h2>{ar ? "المجتمعات العامة" : "Public Communities"}</h2>
          </div>
        </div>

        <div className="rv-community-cards">
          {placeholderCommunities.map((community) => (
            <Link key={community.id} href={`/${locale}/communities/${community.id}`} className="rv-community-card">
              <div className="rv-community-info">
                <h3>{community.name[ar ? "ar" : "en"]}</h3>
                <p className="rv-community-desc">{community.description[ar ? "ar" : "en"]}</p>
                <div className="rv-community-meta">
                  <span className="rv-community-members">{community.membersCount}</span>
                  <span className="rv-community-visibility">
            {community.visibility === "public" ? (ar ? "علني" : "Public") : (ar ? "خاص" : "Private")}
          </span>
                </div>
              </div>
              <span className="rv-community-link">{ar ? "انضم" : "Join"} →</span>
            </Link>
          ))}
        </div>

        <div className="rv-join-cta">
          <p className="rv-eyebrow">{ar ? "هل أنت المبدع؟" : "Are you a creator?"}</p>
          <Link href={`/${locale}/creator/community`} className="rv-community-create-btn">
            {ar ? "إنشاء مجتمع" : "Create a community"} ↗
          </Link>
          <p className="rv-community-note">
            {ar
              ? "إنشاء مجتمع يتطلب هوية إبداعية نشطة."
              : "Creating a community requires an active creative identity."}
          </p>
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