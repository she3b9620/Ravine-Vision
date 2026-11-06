import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createWorkDraft } from "./actions";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> };

export default async function StudioPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");
  const { data: identities } = await supabase.from("creator_identities").select("id,display_name,handle").eq("owner_account_id", user.id).order("created_at", { ascending: false });
  const errors: Record<string,string> = ar ? { validation:"راجع عنوان العمل ونوعه ولغته.", identity:"الهوية المختارة غير متاحة لحسابك.", save:"تعذر حفظ المسودة. حاول مرة أخرى." } : { validation:"Check the work title, type, and language.", identity:"That creative identity is not available to your account.", save:"The draft could not be saved. Try again." };
  return <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
    <header className="creator-header"><Link className="rv-logo" href={"/"+locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link><nav><Link href={"/"+locale+"/creator"}>{ar?"مساحة المبدع":"Creator space"}</Link><Link href={"/"+locale+"/creator/library"}>{ar?"مكتبة الأعمال":"Work library"}</Link></nav></header>
    <section className="creator-intro"><p className="rv-eyebrow"><i/>CREATOR STUDIO</p><h1>{ar?"ابدأ عملًا جديدًا.":"Start a new work."}</h1><p>{ar?"أنشئ سجلًا أوليًا لعملك واحفظه كمسودة خاصة. النشر ورفع الملفات سيُفتحان بعد استكمال مسارات المراجعة والحقوق والوسائط.":"Create an initial record and keep it as a private draft. Publishing and file uploads will be enabled after the rights, media, and review workflows are complete."}</p></section>
    {query.error && <p className="creator-alert" role="alert">{errors[query.error] ?? ""}</p>}
    {identities?.length ? <section className="creator-panel"><h2>{ar?"إنشاء مسودة عمل":"Create a work draft"}</h2>
      <form action={createWorkDraft} className="creator-form">
        <input type="hidden" name="locale" value={locale}/>
        <label>{ar?"الهوية الإبداعية":"Creative identity"}<select name="creator_identity_id" required defaultValue=""><option value="" disabled>{ar?"اختر هوية":"Choose an identity"}</option>{identities.map((identity)=><option key={identity.id} value={identity.id}>{identity.display_name} (@{identity.handle})</option>)}</select></label>
        <label>{ar?"عنوان العمل":"Work title"}<input name="title" minLength={2} maxLength={160} required/></label>
        <label>{ar?"نبذة مختصرة (اختياري)":"Short synopsis (optional)"}<textarea name="synopsis" maxLength={3000} rows={4}/></label>
        <label>{ar?"نوع العمل":"Work type"}<select name="kind" defaultValue="video">{[["short","Short"],["video","Video"],["podcast","Podcast"],["documentary","Documentary"],["short_film","Short film"],["feature_film","Feature film"],["series","Series"],["photography","Photography"],["visual_art","Visual art"],["music","Music"],["writing","Writing"],["book","Book"],["research","Research"],["lecture","Lecture"],["conversation","Conversation"],["archive","Archive"],["other","Other"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label>{ar?"لغة العمل":"Work language"}<select name="language_code" defaultValue={locale}><option value="ar">العربية</option><option value="en">English</option><option value="und">{ar?"غير محددة":"Unspecified"}</option></select></label>
        <button className="creator-submit" type="submit">{ar?"حفظ كمسودة":"Save as draft"} <span>↗</span></button>
      </form>
    </section> : <section className="creator-panel"><h2>{ar?"تحتاج إلى هوية إبداعية أولًا":"A creative identity is required first"}</h2><p className="creator-muted">{ar?"أنشئ هوية إبداعية أو أرسل طلب الانضمام قبل تسجيل أعمالك.":"Create a creative identity or submit an application before registering works."}</p><Link className="creator-submit" href={"/"+locale+"/creator"}>{ar?"الانتقال لمساحة المبدع":"Open creator space"} ↗</Link></section>}
  </main>;
}