import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }> };

export default async function EarningsPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");

  const [{ data: entries }, { data: payouts }] = await Promise.all([
    supabase.from("economic_ledger")
      .select("id,creator_identity_id,source_reference,entry_type,amount_minor,currency_code,direction,status,created_at")
      .eq("account_id", user.id).order("created_at", { ascending: false }).limit(100),
    supabase.from("payout_requests")
      .select("id,amount_minor,currency_code,status,created_at")
      .eq("payee_account_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);

  const entryLabels: Record<string, string> = ar
    ? { earning: "استحقاق", platform_fee: "رسوم منصة", refund: "استرداد", chargeback: "اعتراض دفع", adjustment: "تسوية", payout: "سحب", reversal: "عكس قيد" }
    : { earning: "Earning", platform_fee: "Platform fee", refund: "Refund", chargeback: "Chargeback", adjustment: "Adjustment", payout: "Payout", reversal: "Reversal" };
  const statusLabels: Record<string, string> = ar
    ? { pending: "معلق", available: "متاح", held: "محتجز", reversed: "معكوس", requested: "تم الطلب", under_review: "قيد المراجعة", processing: "قيد التنفيذ", paid: "مدفوع", failed: "متعذر", cancelled: "ملغى" }
    : { pending: "Pending", available: "Available", held: "On hold", reversed: "Reversed", requested: "Requested", under_review: "Under review", processing: "Processing", paid: "Paid", failed: "Failed", cancelled: "Cancelled" };

  return <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
    <header className="creator-header">
      <Link className="rv-logo" href={"/" + locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link>
      <nav><Link href={"/" + locale + "/creator"}>{ar ? "مساحة المبدع" : "Creator space"}</Link><Link href={"/" + locale + "/creator/library"}>{ar ? "الأعمال" : "Works"}</Link></nav>
    </header>
    <section className="creator-intro">
      <p className="rv-eyebrow"><i/>CREATOR ECONOMY</p>
      <h1>{ar ? "سجلّك الاقتصادي." : "Your economic record."}</h1>
      <p>{ar ? "سجل خاص وشفاف للاستحقاقات والرسوم والتسويات وطلبات السحب. لا تُنشئ المشاهدات أو المتابعات وحدها أي استحقاق مالي." : "A private, transparent record of earnings, fees, adjustments, and payout requests. Views and follows alone do not create financial entitlements."}</p>
    </section>
    <section className="creator-panel">
      <h2>{ar ? "سجل الحركات" : "Ledger activity"}</h2>
      <p className="creator-muted">{ar ? "القيم معروضة بوحدات العملة الصغرى كما سُجلت محاسبيًا؛ لا نفترض عدد المنازل العشرية أو سعر صرف." : "Amounts are shown in the currency's recorded minor units. No decimal precision or exchange rate is assumed."}</p>
      {entries?.length ? <div className="creator-work-list">{entries.map((entry) => <article className="creator-identity" key={entry.id}>
        <div className="creator-library-heading"><h3>{entryLabels[entry.entry_type] ?? entry.entry_type}</h3><strong>{entry.direction === "debit" ? "−" : "+"}{entry.amount_minor} {entry.currency_code}</strong></div>
        <p>{entry.source_reference}</p>
        <small>{statusLabels[entry.status] ?? entry.status} · {new Date(entry.created_at).toLocaleString(ar ? "ar-EG" : "en-GB")}</small>
      </article>)}</div> : <p className="creator-muted">{ar ? "لا توجد حركات مالية مسجلة على حسابك حاليًا." : "There are no financial ledger entries on your account yet."}</p>}
    </section>
    <section className="creator-panel">
      <h2>{ar ? "طلبات السحب" : "Payout requests"}</h2>
      {payouts?.length ? <div className="creator-work-list">{payouts.map((payout) => <article className="creator-identity" key={payout.id}>
        <div className="creator-library-heading"><strong>{payout.amount_minor} {payout.currency_code}</strong><small>{statusLabels[payout.status] ?? payout.status}</small></div>
        <small>{new Date(payout.created_at).toLocaleString(ar ? "ar-EG" : "en-GB")}</small>
      </article>)}</div> : <p className="creator-muted">{ar ? "لا توجد طلبات سحب." : "No payout requests."}</p>}
      <p className="creator-disclaimer">{ar ? "طلبات السحب الآلية ومزودو الدفع غير مفعّلين. ستُفتح بعد اعتماد البلدان والعملات والأهلية والضرائب والرسوم وسياسات النزاعات." : "Automated payouts and payment providers are not enabled. They will open only after country, currency, eligibility, tax, fee, and dispute policies are approved."}</p>
    </section>
  </main>;
}
