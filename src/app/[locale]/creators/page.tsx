import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { DISCIPLINE_LABELS, labelFor } from "@/lib/labels";

export const dynamic = "force-dynamic";

type CreatorRow = {
  id: string;
  display_name: string;
  handle: string | null;
  biography: string | null;
  discipline_tags: string[];
};

export default async function CreatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  let creators: CreatorRow[] = [];
  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("creator_identities")
        .select("id,display_name,handle,biography,discipline_tags")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(60);
      creators = (data ?? []) as CreatorRow[];
    } catch {
      creators = [];
    }
  }

  return (
    <main className="simple-page creators-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}`}>{ar ? "← الرئيسية" : "← Home"}</Link>
      <p className="eyebrow">RAVINE / CREATORS</p>
      <h1>{ar ? "وراء كل عمل، إنسان." : "Behind every work, a human voice."}</h1>
      <p>
        {ar
          ? "مبدعون تم توثيق هوياتهم الإبداعية ونشر أعمالهم في رافين. الاكتشاف يبدأ من الهوية والسياق، لا مجرد عدد المتابعين."
          : "Creators with verified creative identities and published works on RAVINE. Discovery begins with voice and context, not vanity metrics."}
      </p>

      {creators.length ? (
        <div className="domain-grid creators-grid">
          {creators.map((creator) => (
            <Link className="domain-card public-creator-card" key={creator.id} href={`/${locale}/creators/${creator.id}`}>
              <div className="creator-card-header">
                <span className="creator-avatar-fallback">{creator.display_name.slice(0, 1) || "R"}</span>
                <div>
                  <h2>{creator.display_name}</h2>
                  {creator.handle && <small className="creator-handle">@{creator.handle}</small>}
                </div>
              </div>
              <p>{creator.biography || (ar ? "هوية إبداعية معتمدة في رافين." : "A verified creative identity on RAVINE.")}</p>
              {creator.discipline_tags?.length > 0 && (
                <div className="creator-tags">
                  {creator.discipline_tags.map((tag) => (
                    <span key={tag} className="creator-tag">{labelFor(DISCIPLINE_LABELS, tag, locale)}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-catalog-state">
          <p className="coming-note">{ar ? "لا يوجد مبدعون معتمدون علنًا بعد." : "No publicly approved creators yet."}</p>
          <div className="empty-catalog-cta">
            <Link className="action-button-accent" href={`/${locale}/creator`}>
              {ar ? "تقديم طلب هوية إبداعية ↗" : "Apply for a Creative Identity ↗"}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
