import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { DISCIPLINE_LABELS, labelFor } from "@/lib/labels";
import { submitCreatorApplication } from "./actions";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string; submitted?: string }> };

export default async function CreatorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);
  const { data: identities } = await supabase.from("creator_identities").select("id,display_name,handle,biography,discipline_tags,status,created_at").eq("owner_account_id", user.id).order("created_at", { ascending: false });
  const ids = (identities ?? []).map((item) => item.id);
  const { data: applications } = ids.length ? await supabase.from("creator_applications").select("id,creator_identity_id,status,submitted_at").in("creator_identity_id", ids).order("submitted_at", { ascending: false }) : { data: [] as { id:string; creator_identity_id:string; status:string; submitted_at:string }[] };
  const errors: Record<string,string> = ar
    ? { validation:"راجع البيانات المطلوبة وتأكد من طول النبذة وبيان التقديم.", identity:"تعذر إنشاء الهوية؛ ربما اسم المستخدم مستخدم بالفعل.", application:"تم إنشاء الهوية لكن تعذر حفظ الطلب. راجع الحالة قبل إعادة المحاولة." }
    : { validation:"Check the required fields and the minimum biography and statement lengths.", identity:"Could not create the identity; the handle may already be taken.", application:"The identity was created, but the application could not be saved. Check its status before retrying." };
  const status: Record<string,string> = ar
    ? { draft:"مسودة", submitted:"قيد المراجعة", under_review:"قيد المراجعة", approved:"مقبول", rejected:"غير مقبول", withdrawn:"مسحوب", active:"نشطة", restricted:"مقيّدة", closed:"مغلقة" }
    : { draft:"Draft", submitted:"Submitted", under_review:"Under review", approved:"Approved", rejected:"Not approved", withdrawn:"Withdrawn", active:"Active", restricted:"Restricted", closed:"Closed" };
  return <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
    <header className="creator-header"><Link className="rv-logo" href={"/"+locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link><nav><Link href={"/"+locale+"/profile"}>{ar?"حسابي":"My account"}</Link><Link href={"/"+locale+"/creator/studio"}>{ar?"الاستوديو":"Studio"}</Link><Link href={"/"+locale+"/creator/earnings"}>{ar?"الاقتصاد":"Economy"}</Link><Link href={"/"+locale+"/creator/team"}>{ar?"الفريق":"Team"}</Link></nav></header>
    <section className="creator-intro"><p className="rv-eyebrow"><i/>CREATOR UNIVERSE</p><h1>{ar?"مساحتك الإبداعية.":"Your creative universe."}</h1><p>{ar?"هوية إبداعية مستقلة داخل حسابك الشخصي لإدارة أعمالك ومشروعاتك وجمهورك. التقديم لا يعني القبول التلقائي ولا يغيّر تصنيف حسابك.":"An independent creative identity within your personal account. Applying does not guarantee acceptance or automatically change your account tier."}</p></section>
    {(query.error || query.submitted) && <p className={query.submitted?"creator-alert success":"creator-alert"} role="status">{query.submitted?(ar?"وصل طلبك وسيظل قيد المراجعة حتى اتخاذ قرار.":"Your application was received and will remain under review."):(errors[query.error??""]??"")}</p>}
    <div className="creator-columns">
      <section className="creator-panel"><h2>{ar?"هوياتك الإبداعية":"Your creative identities"}</h2>
        {identities?.length ? identities.map((item)=>{const application=applications?.find((a)=>a.creator_identity_id===item.id);return <article className="creator-identity" key={item.id}><h3>{item.display_name}</h3><span>{item.handle?"@"+item.handle:(ar?"بدون معرّف":"No handle")}</span><p>{item.biography}</p><small>{ar?"حالة الهوية":"Identity"}: {status[item.status]??item.status}</small>{application&&<small>{ar?"حالة الطلب":"Application"}: {status[application.status]??application.status}</small>}</article>}) : <p className="creator-muted">{ar?"لم تنشئ هوية إبداعية بعد.":"No creative identity yet."}</p>}
      </section>
      <section className="creator-panel"><h2>{ar?"طلب الانضمام كمبدع":"Apply as a creator"}</h2><p className="creator-muted">{ar?"ابدأ بهوية واحدة واضحة. كل هوية تخضع لمراجعة مستقلة.":"Start with one clear identity. Each identity is reviewed independently."}</p>
        <form action={submitCreatorApplication} className="creator-form">
          <input type="hidden" name="locale" value={locale}/>
          <label>{ar?"الاسم الإبداعي":"Creative name"}<input name="display_name" minLength={2} maxLength={80} required/></label>
          <label>{ar?"اسم المستخدم (إنجليزي)":"Handle (English)"}<input name="handle" pattern="[A-Za-z0-9_]{3,30}" minLength={3} maxLength={30} placeholder="your_name" required/></label>
          <label>{ar?"نبذة عنك وخبرتك":"Biography and experience"}<textarea name="biography" minLength={30} maxLength={2000} rows={4} required/></label>
          <fieldset><legend>{ar?"مجالاتك الإبداعية (اختر واحدًا على الأقل)":"Creative disciplines (choose at least one)"}</legend>{["cinema","video","photography","music","writing","research","visual_art","education","culture","other"].map((v)=><label className="creator-check" key={v}><input type="checkbox" name="discipline" value={v}/><span>{labelFor(DISCIPLINE_LABELS,v,locale)}</span></label>)}</fieldset>
          <label>{ar?"بيان التقديم: ماذا تصنع؟ ولماذا تريد الانضمام؟":"Application statement: What do you create, and why RAVINE?"}<textarea name="statement" minLength={50} maxLength={4000} rows={6} required/></label>
          <button className="creator-submit" type="submit">{ar?"إرسال طلب المراجعة":"Submit for review"} <span>↗</span></button>
        </form>
      </section>
    </div>
    <p className="creator-disclaimer">{ar?"لا توجد رسوم تقديم. لا يمنح الطلب توثيقًا أو أهلية ربح أو حق نشر تلقائيًا.":"There is no application fee. Applying does not grant verification, monetization eligibility, or automatic publishing rights."}</p>
  </main>;
}
