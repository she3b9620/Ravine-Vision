import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CreatorRef = { display_name: string; handle: string | null; biography: string | null };
type WorkRow = {
  id: string;
  title: string;
  synopsis: string | null;
  kind: string;
  language_code: string;
  published_at: string | null;
  creator_identity_id: string;
  creator_identities: CreatorRef | CreatorRef[] | null;
};

export default async function WorkDetailPage({ params }: { params: Promise<{ locale: string; workId: string }> }) {
  const { locale, workId } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("id,title,synopsis,kind,language_code,published_at,creator_identity_id,creator_identities(display_name,handle,biography)")
    .eq("id", workId)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();
  if (!data) notFound();
  const work = data as WorkRow;
  const creatorValue = work.creator_identities;
  const creator = !creatorValue ? null : Array.isArray(creatorValue) ? creatorValue[0] ?? null : creatorValue;
  const published = work.published_at
    ? new Date(work.published_at).toLocaleDateString(ar ? "ar-EG" : "en-GB", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <main className="simple-page work-detail" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}/works`}>{ar ? "← كل الأعمال" : "← All works"}</Link>
      <p className="eyebrow">RAVINE / {work.kind.replaceAll("_", " ").toUpperCase()}</p>
      <h1>{work.title}</h1>
      {creator && (
        <p className="work-creator">
          {creator.display_name}{creator.handle ? " · @" + creator.handle : ""}
        </p>
      )}
      <p>{work.synopsis || (ar ? "لم يضف صاحب العمل نبذة بعد." : "The creator has not added a synopsis yet.")}</p>
      {creator?.biography && <p className="work-creator-bio">{creator.biography}</p>}
      <div className="work-meta">
        {published && <span>{ar ? "نُشر في " : "Published "}{published}</span>}
        <span>{ar ? "اللغة: " : "Language: "}{work.language_code.toUpperCase()}</span>
      </div>
      <p className="creator-disclaimer">{ar ? "حقوق العمل وسياقه ومسؤولية إقراراته تعود إلى هويته الإبداعية المعلنة. النشر لا يعني مصادرة رافين للملكية." : "Rights, context, and declaration responsibility remain with the declared creative identity. Publication does not transfer ownership to RAVINE."}</p>
    </main>
  );
}
