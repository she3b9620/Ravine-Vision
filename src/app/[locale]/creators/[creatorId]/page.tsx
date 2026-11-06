import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

type CreatorData = {
  id: string;
  display_name: string;
  handle: string | null;
  biography: string | null;
  discipline_tags: string[];
  status: string;
  created_at: string;
};

type WorkItem = {
  id: string;
  title: string;
  synopsis: string | null;
  kind: string;
  published_at: string | null;
};

type CommunityItem = {
  id: string;
  name: string;
  description: string | null;
};

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; creatorId: string }>;
}) {
  const { locale, creatorId } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  let creator: CreatorData | null = null;
  let works: WorkItem[] = [];
  let communities: CommunityItem[] = [];

  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data: creatorRes } = await supabase
        .from("creator_identities")
        .select("id,display_name,handle,biography,discipline_tags,status,created_at")
        .eq("id", creatorId)
        .eq("status", "active")
        .maybeSingle();

      creator = creatorRes as CreatorData | null;

      if (creator) {
        const { data: worksRes } = await supabase
          .from("works")
          .select("id,title,synopsis,kind,published_at")
          .eq("creator_identity_id", creator.id)
          .eq("status", "published")
          .eq("visibility", "public")
          .order("published_at", { ascending: false });

        works = (worksRes ?? []) as WorkItem[];

        const { data: comRes } = await supabase
          .from("communities")
          .select("id,name,description")
          .eq("owner_creator_identity_id", creator.id)
          .eq("visibility", "public");

        communities = (comRes ?? []) as CommunityItem[];
      }
    } catch {
      creator = null;
    }
  }

  if (!creator) notFound();

  return (
    <main className="simple-page creator-profile-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}/creators`}>
        {ar ? "← كل المبدعين" : "← All Creators"}
      </Link>

      <section className="creator-profile-header">
        <div className="creator-profile-avatar">
          {creator.display_name.slice(0, 1) || "R"}
        </div>
        <div className="creator-profile-headings">
          <p className="eyebrow">RAVINE / CREATOR IDENTITY</p>
          <h1>{creator.display_name}</h1>
          {creator.handle && <p className="creator-handle-large">@{creator.handle}</p>}
        </div>
      </section>

      {creator.biography && (
        <section className="creator-profile-bio">
          <p>{creator.biography}</p>
        </section>
      )}

      {creator.discipline_tags?.length > 0 && (
        <div className="creator-tags">
          {creator.discipline_tags.map((tag) => (
            <span key={tag} className="creator-tag">{tag}</span>
          ))}
        </div>
      )}

      <section className="creator-profile-section">
        <h2>{ar ? "الأعمال المنشورة" : "Published Works"} <span>({works.length})</span></h2>
        {works.length ? (
          <div className="domain-grid works-grid">
            {works.map((work) => (
              <Link className="domain-card public-work-card" key={work.id} href={`/${locale}/works/${work.id}`}>
                <span>{work.kind.replaceAll("_", " ").toUpperCase()}</span>
                <h3>{work.title}</h3>
                <p>{work.synopsis || (ar ? "عمل منشور على رافين." : "A work published on RAVINE.")}</p>
                {work.published_at && (
                  <small>
                    {new Date(work.published_at).toLocaleDateString(ar ? "ar-EG" : "en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="coming-note">{ar ? "لا توجد أعمال منشورة علنًا لهذا المبدع بعد." : "No published works by this creator yet."}</p>
        )}
      </section>

      {communities.length > 0 && (
        <section className="creator-profile-section">
          <h2>{ar ? "المجتمعات التابعة" : "Associated Communities"}</h2>
          <div className="domain-grid communities-grid">
            {communities.map((com) => (
              <Link className="domain-card public-community-card" key={com.id} href={`/${locale}/communities/${com.id}`}>
                <h3>{com.name}</h3>
                <p>{com.description || (ar ? "مجتمع تابع للهوية الإبداعية." : "Community associated with this creator.")}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="creator-profile-footer">
        <Link className="report-link" href={`/${locale}/report?subject_type=creator_identity&subject_id=${creator.id}`}>
          {ar ? "إبلاغ عن محتوى أو انتهاك ↗" : "Report content or violation ↗"}
        </Link>
      </footer>
    </main>
  );
}
