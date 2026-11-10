import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { WORK_KIND_LABELS, labelFor } from "@/lib/labels";
import { updateWorkDraft } from "./actions";
export const dynamic="force-dynamic";
type Props={params:Promise<{locale:string;workId:string}>};
const kinds=["short","video","podcast","documentary","short_film","feature_film","series","photography","visual_art","music","writing","book","research","lecture","conversation","archive","other"];
export default async function EditWorkPage({params}:Props){
 const {locale,workId}=await params;
 if(locale!=="ar"&&locale!=="en") notFound();
 const ar=locale==="ar"; const { supabase, user } = await requireUser(locale);
 const {data:work}=await supabase.from("works").select("id,creator_identity_id,title,synopsis,kind,language_code,visibility").eq("id",workId).eq("created_by",user.id).eq("status","draft").maybeSingle();
 if(!work) notFound();
 const {data:identity}=await supabase.from("creator_identities").select("display_name,handle").eq("id",work.creator_identity_id).eq("owner_account_id",user.id).maybeSingle();
 if(!identity) notFound();
 return <main className="creator-screen" dir={ar?"rtl":"ltr"}>
 <header className="creator-header"><Link className="rv-logo" href={"/"+locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link><nav><Link href={"/"+locale+"/creator/library"}>{ar?"مكتبة الأعمال":"Work library"}</Link></nav></header>
 <section className="creator-intro"><p className="rv-eyebrow"><i/>EDIT DRAFT</p><h1>{ar?"تعديل المسودة.":"Edit your draft."}</h1><p>{ar?"يمكن تعديل المسودة الخاصة فقط. لا تتضمن هذه الخطوة نشر العمل أو إتاحته للجمهور.":"Only private drafts can be edited here. This does not publish or expose the work."}</p></section>
 <section className="creator-panel"><div className="creator-identity"><strong>{ar?"الهوية المالكة للعمل":"Work-owning identity"}</strong><p>{identity.display_name} {identity.handle ? "(@"+identity.handle+")" : ""}</p><small>{ar?"لا يمكن تغيير الهوية المالكة من شاشة تعديل المسودة.":"The owning identity cannot be changed from the draft editor."}</small></div><p><Link className="creator-inline-link" href={"/"+locale+"/creator/library/"+work.id+"/rights"}>{ar?"إدارة الحقوق والملكية":"Manage rights & ownership"} ↗</Link> <Link className="creator-inline-link" href={"/"+locale+"/creator/library/"+work.id+"/media"}>{ar?"تجهيز الوسائط":"Prepare media"} ↗</Link></p><form action={updateWorkDraft} className="creator-form">
 <input type="hidden" name="locale" value={locale}/><input type="hidden" name="work_id" value={work.id}/>
 <label>{ar?"عنوان العمل":"Work title"}<input name="title" minLength={2} maxLength={160} required defaultValue={work.title}/></label>
 <label>{ar?"نبذة مختصرة":"Short synopsis"}<textarea name="synopsis" maxLength={3000} rows={5} defaultValue={work.synopsis??""}/></label>
 <label>{ar?"نوع العمل":"Work type"}<select name="kind" defaultValue={work.kind}>{kinds.map(k=><option key={k} value={k}>{labelFor(WORK_KIND_LABELS,k,locale)}</option>)}</select></label>
 <label>{ar?"لغة العمل":"Work language"}<select name="language_code" defaultValue={work.language_code}><option value="ar">العربية</option><option value="en">English</option><option value="und">{ar?"غير محددة":"Unspecified"}</option></select></label>
 <label>{ar?"الظهور بعد النشر":"Visibility after publishing"}<select name="visibility" defaultValue={work.visibility}><option value="public">{ar?"عام — يظهر للجمهور بعد اعتماد النشر":"Public — visible after publication approval"}</option><option value="unlisted">{ar?"غير مدرج — بالرابط فقط":"Unlisted — link only"}</option><option value="private">{ar?"خاص — لا يظهر علنًا":"Private — never public"}</option></select></label>
 <p className="creator-muted">{ar?"اختيار «عام» لا ينشر العمل بنفسه؛ النشر يتم فقط بعد مراجعة الفريق واعتماده. العمل يبقى مسودةً خاصة حتى ذلك الحين.":"Choosing “Public” does not publish the work by itself; publishing happens only after team review approval. The work stays a private draft until then."}</p>
 <button className="creator-submit" type="submit">{ar?"حفظ التعديلات":"Save changes"} ↗</button></form></section></main>;
}