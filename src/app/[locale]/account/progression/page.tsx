import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { TIER_LABELS, TIER_REQUEST_STATUS_LABELS, labelFor } from "@/lib/labels";
import { requestAccountTier } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
};

type Tier = "viewer" | "creator" | "verified" | "select";
const TIER_ORDER: Record<Tier, number> = { viewer: 0, creator: 1, verified: 2, select: 3 };

export default async function ProgressionPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);

  const [{ data: profile }, { data: requests }] = await Promise.all([
    supabase.from("profiles").select("account_tier").eq("id", user.id).maybeSingle(),
    supabase
      .from("account_tier_requests")
      .select("id,requested_tier,statement,status,submitted_at,review_notes")
      .eq("account_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(10),
  ]);

  const currentTier = (
    profile?.account_tier && profile.account_tier in TIER_ORDER ? profile.account_tier : "viewer"
  ) as Tier;

  return (
    <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>{ar ? "تطور الحساب" : "Account progression"}</nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow"><i />PERSONAL UNIVERSE</p>
        <h1>{ar ? "مسار تطور حسابك." : "Your account progression."}</h1>
        <p>
          {ar
            ? "تصنيف الحساب يعكس مستوى المشاركة والمسؤولية داخل رافين. تقديم الطلب لا يضمن القبول ولا يغيّر تصنيفك تلقائيًا."
            : "Account tiers reflect participation and responsibility in RAVINE. Applying does not guarantee approval or automatically change your tier."}
        </p>
        <small>
          {ar ? "تصنيفك الحالي" : "Current tier"}: {labelFor(TIER_LABELS, currentTier, locale)}
        </small>
      </section>

      {query.done && (
        <p className="creator-alert success" role="status">
          {ar ? "تم إرسال طلبك للمراجعة." : "Your request has been submitted for review."}
        </p>
      )}
      {query.error && (
        <p className="creator-alert" role="alert">
          {ar
            ? "تعذر إرسال الطلب. قد يكون لديك طلب قيد المراجعة بالفعل."
            : "Unable to submit. You may already have a pending request."}
        </p>
      )}

      <section className="creator-panel">
        <h2>{ar ? "طلب ترقية التصنيف" : "Request a tier review"}</h2>
        <form action={requestAccountTier} className="creator-form">
          <input type="hidden" name="locale" value={locale} />
          <label>
            {ar ? "التصنيف المطلوب" : "Requested tier"}
            <select name="requested_tier" required defaultValue="">
              <option value="" disabled>{ar ? "اختر التصنيف" : "Choose a tier"}</option>
              {(["creator", "verified", "select"] as const)
                .filter((tier) => TIER_ORDER[tier] > TIER_ORDER[currentTier])
                .map((tier) => (
                  <option key={tier} value={tier}>
                    {labelFor(TIER_LABELS, tier, locale)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {ar ? "اشرح سبب طلبك وما الذي تقدمه للمجتمع" : "Explain your request and contribution"}
            <textarea name="statement" rows={6} minLength={50} maxLength={4000} required />
          </label>
          <label>
            {ar ? "روابط الأعمال أو الأدلة (رابط في كل سطر)" : "Work or evidence links (one per line)"}
            <textarea name="evidence_references" rows={3} maxLength={10000} />
          </label>
          <button className="creator-submit" type="submit">
            {ar ? "إرسال للمراجعة" : "Submit for review"}
          </button>
        </form>
      </section>

      <section className="creator-panel">
        <h2>{ar ? "طلباتك السابقة" : "Your requests"}</h2>
        {requests?.length ? (
          requests.map((item) => (
            <article className="creator-identity" key={item.id}>
              <strong>{labelFor(TIER_LABELS, item.requested_tier, locale)}</strong>
              <small>
                {labelFor(TIER_REQUEST_STATUS_LABELS, item.status, locale)} ·{" "}
                {new Date(item.submitted_at).toLocaleDateString(ar ? "ar-EG" : "en-US")}
              </small>
              <p>{item.statement}</p>
              {item.review_notes && (
                <p>
                  {ar ? "ملاحظات المراجعة: " : "Review notes: "}
                  {item.review_notes}
                </p>
              )}
            </article>
          ))
        ) : (
          <p className="creator-muted">{ar ? "لا توجد طلبات سابقة." : "No previous requests."}</p>
        )}
      </section>
    </main>
  );
}
