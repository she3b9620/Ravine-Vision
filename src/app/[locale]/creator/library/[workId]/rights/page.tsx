import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { RIGHTS_DECLARATION_LABELS, RIGHTS_REVIEW_STATUS_LABELS, labelFor } from "@/lib/labels";
import { submitRightsDeclaration } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; workId: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export default async function RightsPage({ params, searchParams }: Props) {
  const { locale, workId } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);

  const { data: work } = await supabase
    .from("works")
    .select("id,title,status")
    .eq("id", workId)
    .eq("created_by", user.id)
    .maybeSingle();
  if (!work) notFound();

  const { data: declarations } = await supabase
    .from("rights_declarations")
    .select("id,declaration,review_status,created_at")
    .eq("work_id", workId)
    .order("created_at", { ascending: false });

  return (
    <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>
          <Link href={"/" + locale + "/creator/library"}>{ar ? "مكتبة الأعمال" : "Work library"}</Link>
        </nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow"><i />RIGHTS & OWNERSHIP</p>
        <h1>{ar ? "الحقوق والملكية." : "Rights & ownership."}</h1>
        <p>
          {ar
            ? "سجّل إقرارك بشأن الحقوق المرتبطة بالعمل. الإقرار ليس إثبات ملكية نهائيًا ولا يحل محل مراجعة المستندات أو موافقات أصحاب الحقوق."
            : "Record your rights declaration for this work. A declaration is not final proof of ownership and does not replace document review or permissions from rights holders."}
        </p>
      </section>

      <section className="creator-panel">
        <h2>{work.title}</h2>
        {query.submitted && (
          <p className="creator-alert success" role="status">
            {ar ? "تم تسجيل الإقرار للمراجعة." : "Declaration submitted for review."}
          </p>
        )}

        {work.status !== "draft" ? (
          <p className="creator-muted">
            {ar
              ? "تُقبل الإقرارات الجديدة للمسودات فقط عبر هذه الواجهة. العمل المنشور لا يمكن تعديل إقراراته من هنا؛ مسار المطالبات والنزاعات على الأعمال المنشورة لم يُعتمد بعد."
              : "New declarations through this screen are accepted for drafts only. A published work cannot change its declaration here; the claims and disputes path for published works is not approved yet."}
          </p>
        ) : (
          <>
            <form action={submitRightsDeclaration} className="creator-form">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="work_id" value={work.id} />
              <label>
                {ar ? "حالة الحقوق التي تقرّ بها" : "Your rights declaration"}
                <select name="declaration" required defaultValue="unknown">
                  {Object.keys(RIGHTS_DECLARATION_LABELS).map((value) => (
                    <option key={value} value={value}>
                      {labelFor(RIGHTS_DECLARATION_LABELS, value, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {ar ? "بيان النسبة أو أسماء أصحاب الحقوق (اختياري)" : "Attribution / rights holders (optional)"}
                <textarea name="attribution_text" maxLength={1000} rows={3} />
              </label>
              <label>
                {ar ? "مرجع الترخيص أو العقد (اختياري)" : "License or contract reference (optional)"}
                <input name="license_reference" maxLength={1000} />
              </label>
              <label>
                {ar ? "مراجع الأدلة، رابط أو مرجع في كل سطر" : "Evidence references, one URL or reference per line"}
                <textarea name="evidence_references" rows={4} placeholder="https://..." />
              </label>
              <button className="creator-submit" type="submit">
                {ar ? "إرسال الإقرار" : "Submit declaration"} ↗
              </button>
            </form>
            <p className="creator-muted">
              {ar
                ? "لا ترفع مستندات حساسة أو بيانات شخصية غير ضرورية. حالة الإقرار تظل غير مراجعة حتى يبتّ فيها فريق مخوّل."
                : "Do not submit sensitive documents or unnecessary personal data. The declaration remains unreviewed until an authorized review takes place."}
            </p>
          </>
        )}
      </section>

      {declarations?.length ? (
        <section className="creator-panel">
          <h2>{ar ? "سجل الإقرارات" : "Declaration history"}</h2>
          {declarations.map((declaration) => (
            <article className="creator-identity" key={declaration.id}>
              <strong>{labelFor(RIGHTS_DECLARATION_LABELS, declaration.declaration, locale)}</strong>
              <small>
                {ar ? "حالة المراجعة" : "Review status"}:{" "}
                {labelFor(RIGHTS_REVIEW_STATUS_LABELS, declaration.review_status, locale)}
              </small>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
