import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CreatorRef = { display_name: string; handle: string | null };
type WorkRow = {
  id: string;
  title: string;
  synopsis: string | null;
  kind: string;
  published_at: string | null;
  creator_identity_id: string;
  creator_identities: CreatorRef | CreatorRef[] | null;
};

function creatorOf(work: WorkRow) {
  const creator = work.creator_identities;
  if (!creator) return null;
  return Array.isArray(creator) ? creator[0] ?? null : creator;
}

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("id,title,synopsis,kind,published_at,creator_identity_id,creator_identities(display_name,handle)")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("published_at", { ascending: false })
    .limit(60);
  const works = (data ?? []) as WorkRow[];

  return (
    <main className="simple-page works-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}`}>{ar ? "← الرئيسية" : "← Home"}</Link>
      <p className="eyebrow">RAVINE / WORKS</p>
      <h1>{ar ? "أعمال تستحق أن تبقى." : "Works that deserve to last."}</h1>
      <p>{ar ? "أعمال اعتمدتها المراجعة ونشرها أصحابها علنًا. كل عمل يحمل هوية صاحبه وسياقه، لا مجرد رقم." : "Works approved through review and published publicly by their creators. Every work carries its creator identity and context—not just a number."}</p>
      {works.length ? (
        <div className="domain-grid works-grid">
          {works.map((work) => {
            const creator = creatorOf(work);
            const published = work.published_at
              ? new Date(work.published_at).toLocaleDateString(ar ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric" })
              : null;
            return (
              <Link className="domain-card public-work-card" key={work.id} href={`/${locale}/works/${work.id}`}>
                <span>{work.kind.replaceAll("_", " ").toUpperCase()}</span>
                <h2>{work.title}</h2>
                <p>{work.synopsis || (ar ? "عمل منشور على رافين." : "A work published on RAVINE.")}</p>
                <small>{creator ? (creator.handle ? "@" + creator.handle : creator.display_name) : ""}{published ? " · " + published : ""}</small>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="coming-note">{ar ? "لا توجد أعمال منشورة علنًا بعد." : "No publicly published works yet."}</p>
      )}
    </main>
  );
}
