import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { REPORT_CATEGORY_LABELS, REPORT_TARGET_LABELS, labelFor } from "@/lib/labels";
import { submitSafetyReport } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    done?: string;
    error?: string;
    target_type?: string;
    target_id?: string;
    // Older links used subject_type/subject_id; still accepted so report links
    // created before the rename keep prefilling correctly.
    subject_type?: string;
    subject_id?: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ReportPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  await requireUser(locale);

  const requestedTarget = query.target_type ?? query.subject_type ?? "";
  const targetType = Object.hasOwn(REPORT_TARGET_LABELS, requestedTarget) ? requestedTarget : "";
  const requestedId = (query.target_id ?? query.subject_id ?? "").trim();
  const targetId = uuidPattern.test(requestedId) ? requestedId : "";

  return (
    <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>{ar ? "السلامة والمجتمع" : "Safety & community"}</nav>
      </header>
      <section className="creator-intro">
        <p className="rv-eyebrow"><i />COMMUNITY SAFETY</p>
        <h1>{ar ? "الإبلاغ عن محتوى أو سلوك" : "Report content or behavior"}</h1>
        <p>
          {ar
            ? "تُراجع البلاغات بواسطة فريق مخوّل. قدّم معلومات دقيقة، ولا تضع بيانات شخصية حساسة لا تلزم لفهم البلاغ."
            : "Reports are reviewed by authorized staff. Provide accurate context and avoid unnecessary sensitive personal information."}
        </p>
      </section>

      {query.done && (
        <p className="creator-alert success" role="status">
          {ar ? "تم استلام البلاغ." : "Your report has been submitted."}
        </p>
      )}
      {query.error && (
        <p className="creator-alert" role="alert">
          {ar ? "تعذر إرسال البلاغ. راجع البيانات وحاول مجددًا." : "The report could not be submitted. Check the details and try again."}
        </p>
      )}

      <section className="creator-panel">
        <form action={submitSafetyReport} className="creator-form">
          <input type="hidden" name="locale" value={locale} />

          <label>
            {ar ? "نوع العنصر" : "Target type"}
            <select name="target_type" required defaultValue={targetType}>
              <option value="" disabled>{ar ? "اختر" : "Choose"}</option>
              {Object.keys(REPORT_TARGET_LABELS).map((value) => (
                <option key={value} value={value}>
                  {labelFor(REPORT_TARGET_LABELS, value, locale)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {ar ? "معرّف العنصر" : "Target ID"}
            <input
              name="target_id"
              required
              minLength={36}
              maxLength={36}
              defaultValue={targetId}
              placeholder="UUID"
              dir="ltr"
            />
          </label>

          <label>
            {ar ? "سبب البلاغ" : "Report category"}
            <select name="category" required defaultValue="">
              <option value="" disabled>{ar ? "اختر" : "Choose"}</option>
              {Object.keys(REPORT_CATEGORY_LABELS).map((value) => (
                <option key={value} value={value}>
                  {labelFor(REPORT_CATEGORY_LABELS, value, locale)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {ar ? "التفاصيل" : "Details"}
            <textarea name="explanation" rows={5} maxLength={4000} />
          </label>

          <label>
            {ar ? "مراجع الأدلة (اختياري، رابط في كل سطر)" : "Evidence references (optional, one per line)"}
            <textarea name="evidence_references" rows={3} maxLength={10000} />
          </label>

          <button className="creator-submit" type="submit">
            {ar ? "إرسال البلاغ" : "Submit report"}
          </button>
        </form>
      </section>
    </main>
  );
}
