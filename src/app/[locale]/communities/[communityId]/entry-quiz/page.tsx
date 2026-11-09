import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import type { EntryQuestion } from "@/lib/community";
import { submitEntryQuizAction } from "./actions";

export const dynamic = "force-dynamic";

type CommunityData = {
  id: string;
  name: string;
  entry_questions: EntryQuestion[] | null;
};

export default async function EntryQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; communityId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, communityId } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  let community: CommunityData | null = null;

  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("communities")
        .select("id,name,entry_questions")
        .eq("id", communityId)
        .maybeSingle();
      community = data as CommunityData | null;
    } catch {
      community = null;
    }
  }

  if (!community) notFound();

  const questions = community.entry_questions ?? [];

  return (
    <main className="simple-page entry-quiz-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}/communities/${communityId}`}>
        {ar ? "←返回 إلى المجتمع" : "← Back to community"}
      </Link>

      <section className="community-header">
        <p className="eyebrow">RAVINE / ENTRY QUIZ</p>
        <h1>{community.name}</h1>
        <p>
          {ar
            ? "أجب على الأسئلة التالية بشكل صحيح للانضمام إلى هذا المجتمع العام."
            : "Answer the following questions correctly to join this public community."}
        </p>

        {query.error === "incorrect" && (
          <p className="quiz-error" role="alert">
            {ar ? "إجابات غير صحيحة. حاول مرة أخرى." : "Incorrect answers. Try again."}
          </p>
        )}

        <form action={submitEntryQuizAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="community_id" value={communityId} />

          <div className="quiz-questions">
            {questions.map((q) => (
              <div key={q.id} className="quiz-question">
                <p className="quiz-question-text">{q.question}</p>
                {q.type === "choice" && q.options ? (
                  q.options.map((opt) => (
                    <label key={opt} className="quiz-choice">
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={opt}
                        required
                      />
                      {opt}
                    </label>
                  ))
                ) : (
                  <input
                    type="text"
                    name={`question_${q.id}`}
                    placeholder={ar ? "أجب هنا..." : "Answer here..."}
                    required
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="action-button-accent">
            {ar ? "إرسال الإجابات والانضمام" : "Submit answers and join"}
          </button>
        </form>
      </section>
    </main>
  );
}
