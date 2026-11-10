import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import EntryQuizBuilder from "@/components/entry-quiz-builder";
import type { EntryQuestion, EntryQuestionInput } from "@/lib/community";
import { saveQuizAction } from "./actions";

export const dynamic = "force-dynamic";

type CommunityRow = {
  id: string;
  name: string;
  owner_creator_identity_id: string | null;
  entry_questions: EntryQuestion[] | null;
};

export default async function ManageCommunityQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; communityId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { locale, communityId } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);

  const { data: communityData } = await supabase
    .from("communities")
    .select("id,name,owner_creator_identity_id,entry_questions")
    .eq("id", communityId)
    .maybeSingle();
  const community = communityData as CommunityRow | null;
  if (!community) notFound();

  let isOwner = false;
  if (community.owner_creator_identity_id) {
    const { data: identity } = await supabase
      .from("creator_identities")
      .select("owner_account_id")
      .eq("id", community.owner_creator_identity_id)
      .maybeSingle();
    isOwner = identity?.owner_account_id === user.id;
  }
  if (!isOwner) notFound();

  // Existing questions are shown without answers; saving replaces the set and
  // requires the owner to re-enter each correct answer.
  const initial: EntryQuestionInput[] = (community.entry_questions ?? []).map((question) => ({
    ...question,
    correct_answer: "",
  }));

  const errors: Record<string, string> = ar
    ? {
        validation: "راجع الأسئلة والإجابات. يجب إدخال إجابة صحيحة لكل سؤال.",
        save: "تعذر حفظ الاختبار. حاول مرة أخرى.",
      }
    : {
        validation: "Check the questions and answers. Every question needs a correct answer.",
        save: "Could not save the quiz. Try again.",
      };

  return (
    <main className="rv-settings-page" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>
          <Link href={"/" + locale + "/creator/community"}>{ar ? "مجتمعاتك" : "Your communities"}</Link>
          <Link href={"/" + locale + "/communities/" + community.id}>
            {ar ? "عرض المجتمع" : "View community"}
          </Link>
        </nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow">
          <i />
          COMMUNITY ENTRY QUIZ
        </p>
        <h1>{community.name}</h1>
        <p>
          {ar
            ? "تُعرض أسئلة الدخول للزوار قبل إرسال طلب الانضمام. الإجابات الصحيحة محفوظة بشكل خاص ولا تُعرض أبداً."
            : "Entry questions are shown before a join request is sent. Correct answers are stored privately and never shown."}
        </p>
      </section>

      {query.saved && (
        <p className="creator-alert success" role="status">
          {ar ? "تم حفظ الاختبار." : "Quiz saved."}
        </p>
      )}
      {query.error && (
        <p className="creator-alert" role="alert">
          {errors[query.error] ?? (ar ? "تعذر تنفيذ العملية." : "The action could not be completed.")}
        </p>
      )}

      <section className="creator-panel">
        <form action={saveQuizAction} className="creator-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="community_id" value={community.id} />
          <EntryQuizBuilder locale={locale} initial={initial} />
          <button className="creator-submit" type="submit">
            {ar ? "حفظ الاختبار" : "Save quiz"} ↗
          </button>
        </form>
        <p className="creator-muted">
          {ar
            ? "الحفظ يستبدل كامل الأسئلة السابقة؛ أعد إدخال الإجابة الصحيحة لكل سؤال."
            : "Saving replaces the whole quiz; re-enter the correct answer for every question."}
        </p>
      </section>
    </main>
  );
}
