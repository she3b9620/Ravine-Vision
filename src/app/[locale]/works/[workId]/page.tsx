import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import WorkReactionsBar from "@/components/work-reactions-bar";
import WorkDiscussion from "@/components/work-discussion";
import { WORK_KIND_LABELS, labelFor } from "@/lib/labels";
import type { ReactionKind } from "./actions";

export const dynamic = "force-dynamic";

type CreatorRef = {
  id: string;
  display_name: string;
  handle: string | null;
  biography: string | null;
};

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

type CommentRaw = {
  id: string;
  body: string;
  created_at: string;
  account_id: string;
  profiles: { display_name: string | null; handle: string | null } | { display_name: string | null; handle: string | null }[] | null;
};

export default async function WorkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; workId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, workId } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  if (!getSupabaseEnvironment()) {
    notFound();
  }

  let work: WorkRow | null = null;
  let currentUserId: string | null = null;
  const reactionCounts = {
    appreciate: 0,
    thoughtful: 0,
    inspiring: 0,
  };
  let userReaction: ReactionKind | null = null;
  const commentsList: Array<{
    id: string;
    body: string;
    created_at: string;
    authorName: string;
    authorHandle: string | null;
  }> = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id ?? null;

    const { data: workData } = await supabase
      .from("works")
      .select(
        "id,title,synopsis,kind,language_code,published_at,creator_identity_id,creator_identities(id,display_name,handle,biography)"
      )
      .eq("id", workId)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();

    if (!workData) notFound();
    work = workData as WorkRow;

    // Fetch reactions
    const { data: reactionsData } = await supabase
      .from("work_reactions")
      .select("reaction, account_id")
      .eq("work_id", workId);

    if (reactionsData) {
      for (const r of reactionsData) {
        if (r.reaction in reactionCounts) {
          reactionCounts[r.reaction as keyof typeof reactionCounts]++;
        }
        if (currentUserId && r.account_id === currentUserId) {
          userReaction = r.reaction as ReactionKind;
        }
      }
    }

    // Fetch comments
    const { data: rawComments } = await supabase
      .from("work_comments")
      .select("id, body, created_at, account_id, profiles(display_name, handle)")
      .eq("work_id", workId)
      .eq("visibility", "visible")
      .order("created_at", { ascending: true });

    if (rawComments) {
      for (const c of rawComments as unknown as CommentRaw[]) {
        const profileVal = c.profiles;
        const profile = Array.isArray(profileVal) ? profileVal[0] : profileVal;
        commentsList.push({
          id: c.id,
          body: c.body,
          created_at: c.created_at,
          authorName: profile?.display_name || "",
          authorHandle: profile?.handle || null,
        });
      }
    }
  } catch {
    notFound();
  }

  if (!work) notFound();

  const creatorValue = work.creator_identities;
  const creator = !creatorValue
    ? null
    : Array.isArray(creatorValue)
    ? creatorValue[0] ?? null
    : creatorValue;

  const published = work.published_at
    ? new Date(work.published_at).toLocaleDateString(ar ? "ar-EG" : "en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="simple-page work-detail-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}/works`}>
        {ar ? "← كل الأعمال" : "← All works"}
      </Link>

      {query.error && (
        <p className="creator-alert" role="alert">
          {query.error === "comment_length"
            ? ar
              ? "التعليق فارغ أو أطول من الحد المسموح."
              : "The comment is empty or longer than the limit."
            : query.error === "comment_failed"
              ? ar
                ? "تعذر نشر التعليق. تأكد أن العمل منشور علنًا وأن حسابك مؤكد."
                : "The comment could not be posted. Confirm the work is published publicly and your account is confirmed."
              : ar
                ? "تعذر تحديث تفاعلك. حاول مرة أخرى."
                : "Could not update your reaction. Try again."}
        </p>
      )}

      <section className="work-theatrical-stage">
        <p className="eyebrow">
          <span></span>
          RAVINE / {labelFor(WORK_KIND_LABELS, work.kind, locale)}
        </p>

        <div className="work-stage-screen">
          <div className="stage-screen-backdrop">
            <span className="stage-symbol">✦</span>
            <p className="stage-kind-title">
              {ar ? "فضاء عرض العمل" : "Work Presentation Stage"}
            </p>
            <p className="stage-kind-subtitle">
              {labelFor(WORK_KIND_LABELS, work.kind, locale)}
            </p>
          </div>
        </div>

        <h1 className="work-title">{work.title}</h1>

        {creator && (
          <div className="work-creator-bar">
            <Link
              href={`/${locale}/creators/${creator.id}`}
              className="work-creator-link"
            >
              <div className="work-creator-avatar">
                {creator.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="work-creator-info">
                <span className="work-creator-name">{creator.display_name}</span>
                {creator.handle && (
                  <span className="work-creator-handle">@{creator.handle}</span>
                )}
              </div>
            </Link>
          </div>
        )}

        <div className="work-synopsis-box">
          <p>
            {work.synopsis ||
              (ar
                ? "لم يضف صاحب العمل نبذة بعد."
                : "The creator has not added a synopsis yet.")}
          </p>
          {creator?.biography && (
            <p className="work-creator-bio">{creator.biography}</p>
          )}
        </div>

        <div className="work-meta">
          {published && (
            <span>
              {ar ? "نُشر في: " : "Published: "}
              {published}
            </span>
          )}
          <span>
            {ar ? "اللغة: " : "Language: "}
            {work.language_code.toUpperCase()}
          </span>
          <span>
            {ar ? "النمط: " : "Kind: "}
            {labelFor(WORK_KIND_LABELS, work.kind, locale)}
          </span>
        </div>
      </section>

      {/* Charter-driven reaction interactions */}
      <WorkReactionsBar
        workId={work.id}
        locale={locale}
        userReaction={userReaction}
        counts={reactionCounts}
        isAuthenticated={!!currentUserId}
      />

      {/* Dignified discussion / reflections thread */}
      <WorkDiscussion
        workId={work.id}
        locale={locale}
        isAuthenticated={!!currentUserId}
        comments={commentsList}
      />

      <section className="work-footer-charter">
        <p className="creator-disclaimer">
          {ar
            ? "حقوق العمل وسياقه ومسؤولية إقراراته تعود إلى هويته الإبداعية المعلنة. النشر لا يعني مصادرة رافين للملكية أو التحكم الإبداعي."
            : "Rights, context, and declaration responsibility remain with the declared creative identity. Publication does not transfer ownership or creative control to RAVINE."}
        </p>
        <div className="work-report-action">
          <Link
            className="report-link"
            href={`/${locale}/report?target_type=work&target_id=${work.id}`}
          >
            {ar ? "الإبلاغ عن مخالفة في هذا العمل" : "Report an issue with this work"}
          </Link>
        </div>
      </section>
    </main>
  );
}
