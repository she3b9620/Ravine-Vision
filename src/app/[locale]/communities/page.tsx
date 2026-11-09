import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { VISIBILITY_LABELS } from "@/lib/community";

export const dynamic = "force-dynamic";

type CreatorRef = { display_name: string; handle: string | null };
type CommunityRow = {
  id: string;
  name: string;
  description: string | null;
  guidelines: string | null;
  visibility: string;
  entry_questions: unknown;
  created_at: string;
  creator_identities: CreatorRef | CreatorRef[] | null;
};

function creatorOf(community: CommunityRow) {
  const creator = community.creator_identities;
  if (!creator) return null;
  return Array.isArray(creator) ? creator[0] ?? null : creator;
}

function visibilityLabel(visibility: string | null, ar: boolean) {
  const key = (visibility ?? "public") as keyof typeof VISIBILITY_LABELS;
  const label = VISIBILITY_LABELS[key] ?? VISIBILITY_LABELS.public;
  return ar ? label.ar : label.en;
}

export default async function CommunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  let communities: CommunityRow[] = [];
  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("communities")
        .select(
          "id,name,description,guidelines,visibility,entry_questions,created_at,creator_identities(display_name,handle)"
        )
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(60);
      communities = (data ?? []) as CommunityRow[];
    } catch {
      communities = [];
    }
  }

  return (
    <main className="simple-page communities-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}`}>{ar ? "← الرئيسية" : "← Home"}</Link>
      <p className="eyebrow">RAVINE / COMMUNITIES</p>
      <h1>{ar ? "المعنى يكبر بالمشاركة." : "Meaning deepens through community."}</h1>
      <p>
        {ar
          ? "مساحات تتشكل حول الاهتمامات والأعمال والقضايا الفكرية والإبداعية، مع خصوصية وقواعد واضحة."
          : "Spaces formed around shared interests, works, and creative inquiries, with clear guidelines and privacy."}
      </p>

      {communities.length ? (
        <div className="domain-grid communities-grid">
          {communities.map((com) => {
            const creator = creatorOf(com);
            const hasEntryQuestions = Array.isArray(com.entry_questions) && com.entry_questions.length > 0;
            return (
              <Link className="domain-card public-community-card" key={com.id} href={`/${locale}/communities/${com.id}`}>
                <span className="community-badge">{visibilityLabel(com.visibility, ar)}</span>
                {hasEntryQuestions && (
                  <span className="community-badge entry-badge">
                    {ar ? "اختبار دخول" : "Entry quiz"}
                  </span>
                )}
                <h2>{com.name}</h2>
                <p>{com.description || (ar ? "مجتمع فكري وإبداعي في رافين." : "A creative and cultural community on RAVINE.")}</p>
                {creator && (
                  <small className="community-owner">
                    {ar ? "المؤسس: " : "Organizer: "}
                    {creator.handle ? "@" + creator.handle : creator.display_name}
                  </small>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-catalog-state">
          <p className="coming-note">{ar ? "لا توجد مجتمعات عامة منشأة بعد." : "No public communities yet."}</p>
          <div className="empty-catalog-cta">
            <Link className="action-button-accent" href={`/${locale}/creator/community`}>
              {ar ? "إنشاء مجتمع جديد ↗" : "Create a new community ↗"}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
