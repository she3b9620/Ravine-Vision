import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import {
  CASE_STATUS_LABELS,
  REPORT_CATEGORY_LABELS,
  REPORT_TARGET_LABELS,
  RIGHTS_DECLARATION_LABELS,
  RIGHTS_REVIEW_STATUS_LABELS,
  TIER_LABELS,
  TIER_REQUEST_STATUS_LABELS,
  WORK_KIND_LABELS,
  WORK_VISIBILITY_LABELS,
  labelFor,
} from "@/lib/labels";
import { reviewItem } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
};

type Application = { id: string; statement: string; status: string; submitted_at: string };
type RightsDeclaration = {
  id: string;
  declaration: string;
  review_status: string;
  work_id: string;
  attribution_text: string | null;
  license_reference: string | null;
  evidence_references: string[];
};
type SafetyReport = {
  id: string;
  category: string;
  target_type: string;
  status: string;
  target_id: string;
  explanation: string | null;
  evidence_references: string[];
};
type TierRequest = { id: string; requested_tier: string; account_id: string; status: string; statement: string };
type WorkItem = {
  id: string;
  title: string;
  synopsis: string | null;
  kind: string;
  language_code: string;
  visibility: string;
  creator_identity_id: string;
};

const APPLICATION_STATUS_LABELS = {
  submitted: { ar: "مُقدَّم", en: "Submitted" },
  under_review: { ar: "قيد المراجعة", en: "Under review" },
  approved: { ar: "مقبول", en: "Approved" },
  rejected: { ar: "مرفوض", en: "Rejected" },
  withdrawn: { ar: "مسحوب", en: "Withdrawn" },
};

export default async function ReviewConsole({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase } = await requireUser(locale);

  const { data: role } = await supabase.rpc("current_staff_role");
  if (!role || !["reviewer", "moderator", "admin", "owner"].includes(role)) notFound();

  const canReview = ["reviewer", "admin", "owner"].includes(role);
  const canModerate = ["moderator", "admin", "owner"].includes(role);

  const applicationsResult = canReview
    ? await supabase
        .from("creator_applications")
        .select("id,creator_identity_id,applicant_account_id,statement,status,submitted_at")
        .in("status", ["submitted", "under_review"])
        .order("submitted_at", { ascending: true })
        .limit(50)
    : { data: [] };
  const rightsResult = canReview
    ? await supabase
        .from("rights_declarations")
        .select("id,work_id,claimant_account_id,declaration,attribution_text,license_reference,evidence_references,review_status,created_at")
        .in("review_status", ["unreviewed", "under_review"])
        .order("created_at", { ascending: true })
        .limit(50)
    : { data: [] };
  const reportsResult = canModerate
    ? await supabase
        .from("safety_reports")
        .select("id,reporter_account_id,target_type,target_id,category,explanation,evidence_references,status,created_at")
        .in("status", ["submitted", "triaged", "reviewing", "appealed"])
        .order("created_at", { ascending: true })
        .limit(50)
    : { data: [] };
  const tierResult = canReview
    ? await supabase
        .from("account_tier_requests")
        .select("id,account_id,requested_tier,statement,status,submitted_at")
        .in("status", ["submitted", "under_review"])
        .order("submitted_at", { ascending: true })
        .limit(50)
    : { data: [] };
  const worksResult = canReview
    ? await supabase
        .from("works")
        .select("id,title,synopsis,kind,language_code,visibility,creator_identity_id,updated_at")
        .eq("status", "in_review")
        .order("updated_at", { ascending: true })
        .limit(50)
    : { data: [] };

  const applications = applicationsResult.data as Application[] | null;
  const rights = rightsResult.data as RightsDeclaration[] | null;
  const reports = reportsResult.data as SafetyReport[] | null;
  const tierRequests = tierResult.data as TierRequest[] | null;
  const workItems = worksResult.data as WorkItem[] | null;

  return (
    <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav><span>{ar ? "لوحة المراجعة" : "Review console"}</span></nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow"><i />TRUST & REVIEW</p>
        <h1>{ar ? "المراجعة والمساءلة." : "Review & accountability."}</h1>
        <p>
          {ar
            ? "لوحة داخلية للمراجعين المخولين. كل قرار يُنفّذ عبر إجراء محمي ويُسجّل في سجل التدقيق."
            : "An internal console for authorized reviewers. Every decision runs through a protected operation and is recorded in the audit log."}
        </p>
        <small>{ar ? "الدور الحالي" : "Current role"}: {role}</small>
      </section>

      {query.done && (
        <p className="creator-alert success" role="status">
          {ar ? "تم تسجيل القرار." : "Decision recorded."}
        </p>
      )}
      {query.error && (
        <p className="creator-alert" role="alert">
          {ar ? "تعذر تنفيذ القرار. راجع الصلاحية والحالة." : "The decision could not be completed. Check permissions and status."}
        </p>
      )}

      {canModerate && (
        <section className="creator-panel">
          <h2>{ar ? "بلاغات السلامة والإشراف" : "Safety & moderation reports"} ({reports?.length ?? 0})</h2>
          {reports?.length ? (
            reports.map((item) => (
              <article className="creator-identity" key={item.id}>
                <strong>
                  {labelFor(REPORT_CATEGORY_LABELS, item.category, locale)} ·{" "}
                  {labelFor(REPORT_TARGET_LABELS, item.target_type, locale)}
                </strong>
                <small>
                  {labelFor(CASE_STATUS_LABELS, item.status, locale)} ·{" "}
                  {ar ? "المعرّف" : "Target"}: <span dir="ltr">{item.target_id}</span>
                </small>
                {item.explanation && <p>{item.explanation}</p>}
                {item.evidence_references?.map((ref) => (
                  <p key={ref} dir="ltr">{ref}</p>
                ))}
                <form action={reviewItem} className="creator-review-form">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="kind" value="safety_report" />
                  <input type="hidden" name="item_id" value={item.id} />
                  <label>
                    {ar ? "ملاحظات المراجعة" : "Review notes"}
                    <textarea name="notes" maxLength={4000} rows={2} />
                  </label>
                  <button name="decision" value="triaged" className="creator-submit">
                    {ar ? "قيد الفحص" : "Triage"}
                  </button>
                  <button name="decision" value="actioned" className="creator-review-reject">
                    {ar ? "اتخاذ إجراء" : "Action"}
                  </button>
                  <button name="decision" value="dismissed" className="creator-review-reject">
                    {ar ? "إغلاق البلاغ" : "Dismiss"}
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="creator-muted">{ar ? "لا توجد بلاغات مفتوحة." : "No open reports."}</p>
          )}
        </section>
      )}

      {canReview && (
        <>
          <section className="creator-panel">
            <h2>{ar ? "أعمال تنتظر المراجعة" : "Works awaiting review"} ({workItems?.length ?? 0})</h2>
            {workItems?.length ? (
              workItems.map((item) => (
                <article className="creator-identity" key={item.id}>
                  <strong>{item.title}</strong>
                  <small>
                    {labelFor(WORK_KIND_LABELS, item.kind, locale)} · {item.language_code.toUpperCase()} ·{" "}
                    {labelFor(WORK_VISIBILITY_LABELS, item.visibility, locale)}
                  </small>
                  <p>{item.synopsis || (ar ? "لا توجد نبذة." : "No synopsis.")}</p>
                  <form action={reviewItem} className="creator-review-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="kind" value="work" />
                    <input type="hidden" name="item_id" value={item.id} />
                    <label>
                      {ar ? "ملاحظات للمبدع (اختياري)" : "Creator-facing notes (optional)"}
                      <textarea name="notes" maxLength={4000} rows={2} />
                    </label>
                    <button name="decision" value="published" className="creator-submit">
                      {ar ? "نشر العمل" : "Publish work"}
                    </button>
                    <button name="decision" value="changes_requested" className="creator-review-reject">
                      {ar ? "إعادة للمبدع" : "Return for changes"}
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <p className="creator-muted">{ar ? "لا توجد أعمال تنتظر المراجعة." : "No works awaiting review."}</p>
            )}
          </section>

          <section className="creator-panel">
            <h2>
              {ar ? "طلبات ترقية الحساب" : "Account tier progression requests"} ({tierRequests?.length ?? 0})
            </h2>
            {tierRequests?.length ? (
              tierRequests.map((item) => (
                <article className="creator-identity" key={item.id}>
                  <strong>{labelFor(TIER_LABELS, item.requested_tier, locale)}</strong>
                  <small>
                    {labelFor(TIER_REQUEST_STATUS_LABELS, item.status, locale)} ·{" "}
                    {ar ? "الحساب" : "Account"}: <span dir="ltr">{item.account_id}</span>
                  </small>
                  <p>{item.statement}</p>
                  <form action={reviewItem} className="creator-review-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="kind" value="account_tier_request" />
                    <input type="hidden" name="item_id" value={item.id} />
                    <label>
                      {ar ? "ملاحظات داخلية" : "Internal notes"}
                      <textarea name="notes" maxLength={4000} rows={2} />
                    </label>
                    <button name="decision" value="approved" className="creator-submit">
                      {ar ? "اعتماد الترقية" : "Approve tier"}
                    </button>
                    <button name="decision" value="rejected" className="creator-review-reject">
                      {ar ? "رفض الطلب" : "Reject request"}
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <p className="creator-muted">{ar ? "لا توجد طلبات ترقية قيد المراجعة." : "No pending tier requests."}</p>
            )}
          </section>

          <section className="creator-panel">
            <h2>{ar ? "طلبات الانضمام كمبدع" : "Creator applications"} ({applications?.length ?? 0})</h2>
            {applications?.length ? (
              applications.map((item) => (
                <article className="creator-identity" key={item.id}>
                  <strong>{ar ? "طلب انضمام كمبدع" : "Creator application"}</strong>
                  <small>{labelFor(APPLICATION_STATUS_LABELS, item.status, locale)}</small>
                  <p>{item.statement}</p>
                  <form action={reviewItem} className="creator-review-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="kind" value="creator_application" />
                    <input type="hidden" name="item_id" value={item.id} />
                    <label>
                      {ar ? "ملاحظات داخلية (اختياري)" : "Internal notes (optional)"}
                      <textarea name="notes" maxLength={4000} rows={2} />
                    </label>
                    <button name="decision" value="approved" className="creator-submit">
                      {ar ? "اعتماد الهوية" : "Approve identity"}
                    </button>
                    <button name="decision" value="rejected" className="creator-review-reject">
                      {ar ? "رفض الطلب" : "Reject application"}
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <p className="creator-muted">{ar ? "لا توجد طلبات انضمام تنتظر المراجعة." : "No applications awaiting review."}</p>
            )}
          </section>

          <section className="creator-panel">
            <h2>{ar ? "إقرارات الحقوق" : "Rights declarations"} ({rights?.length ?? 0})</h2>
            {rights?.length ? (
              rights.map((item) => (
                <article className="creator-identity" key={item.id}>
                  <strong>{labelFor(RIGHTS_DECLARATION_LABELS, item.declaration, locale)}</strong>
                  <small>
                    {labelFor(RIGHTS_REVIEW_STATUS_LABELS, item.review_status, locale)} ·{" "}
                    {ar ? "العمل" : "Work"}: <span dir="ltr">{item.work_id}</span>
                  </small>
                  {item.attribution_text && <p>{item.attribution_text}</p>}
                  {item.license_reference && <p dir="ltr">{item.license_reference}</p>}
                  {item.evidence_references?.map((ref) => (
                    <p key={ref} dir="ltr">{ref}</p>
                  ))}
                  <form action={reviewItem} className="creator-review-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="kind" value="rights_declaration" />
                    <input type="hidden" name="item_id" value={item.id} />
                    <label>
                      {ar ? "ملاحظات داخلية (اختياري)" : "Internal notes (optional)"}
                      <textarea name="notes" maxLength={4000} rows={2} />
                    </label>
                    <button name="decision" value="accepted" className="creator-submit">
                      {ar ? "قبول الإقرار" : "Accept declaration"}
                    </button>
                    <button name="decision" value="disputed" className="creator-review-reject">
                      {ar ? "اعتراض" : "Dispute"}
                    </button>
                    <button name="decision" value="rejected" className="creator-review-reject">
                      {ar ? "رفض" : "Reject"}
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <p className="creator-muted">{ar ? "لا توجد إقرارات تنتظر المراجعة." : "No declarations awaiting review."}</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
