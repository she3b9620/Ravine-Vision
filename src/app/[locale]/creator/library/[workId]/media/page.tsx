import {notFound,redirect} from "next/navigation";
import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import {registerMediaIntent} from "./actions";
export const dynamic="force-dynamic";
type Props={params:Promise<{locale:string;workId:string}>;searchParams:Promise<{registered?:string;error?:string}>};
export default async function WorkMediaPage({params,searchParams}:Props){
 const {locale,workId}=await params;const query=await searchParams;
 if(locale!=="ar"&&locale!=="en")notFound();const ar=locale==="ar";
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/"+locale+"/login");
 const {data:work}=await supabase.from("works").select("id,title").eq("id",workId).eq("created_by",user.id).eq("status","draft").maybeSingle();if(!work)notFound();
 const {data:assets}=await supabase.from("media_assets").select("id,asset_kind,mime_type,byte_size,state,created_at").eq("owner_account_id",user.id).order("created_at",{ascending:false}).limit(30);
 return <main className="creator-screen" dir={ar?"rtl":"ltr"}>
 <header className="creator-header"><Link className="rv-logo" href={"/"+locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link><nav><Link href={"/"+locale+"/creator/library"}>{ar?"مكتبة الأعمال":"Work library"}</Link><Link href={"/"+locale+"/creator/library/"+workId+"/rights"}>{ar?"الحقوق":"Rights"}</Link></nav></header>
 <section className="creator-intro"><p className="rv-eyebrow"><i/>MEDIA INTAKE</p><h1>{ar?"تجهيز وسائط العمل.":"Prepare work media."}</h1><p>{ar?"سجّل بيانات الملف المطلوب تجهيزه. هذه الخطوة لا ترفع الملف فعليًا ولا تنشئ رابط تخزين؛ ستظل الحالة «بانتظار الرفع» حتى تفعيل مزود التخزين ومسار الرفع الآمن.":"Register the file metadata to be prepared. This does not upload the file or create a storage URL; it remains initiated until a storage provider and secure upload flow are configured."}</p></section>
 <section className="creator-panel"><h2>{work.title}</h2>{query.registered&&<p className="creator-alert success" role="status">{ar?"تم تسجيل بيانات الوسيط. لم يتم رفع الملف بعد.":"Media metadata registered. The file has not been uploaded."}</p>}{query.error&&<p className="creator-alert" role="alert">{ar?"تعذر تسجيل البيانات. راجع النوع والحجم والصيغة.":"Could not register metadata. Check type, size, and format."}</p>}
 <form action={registerMediaIntent} className="creator-form"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="work_id" value={workId}/>
 <label>{ar?"نوع الملف":"Asset type"}<select name="asset_kind" defaultValue="video"><option value="video">{ar?"فيديو":"Video"}</option><option value="audio">{ar?"صوت":"Audio"}</option><option value="image">{ar?"صورة":"Image"}</option><option value="document">{ar?"مستند":"Document"}</option></select></label>
 <label>{ar?"صيغة MIME":"MIME type"}<select name="mime_type" defaultValue="video/mp4"><optgroup label="Video"><option>video/mp4</option><option>video/webm</option><option>video/quicktime</option></optgroup><optgroup label="Audio"><option>audio/mpeg</option><option>audio/mp4</option><option>audio/wav</option><option>audio/ogg</option><option>audio/webm</option></optgroup><optgroup label="Image"><option>image/jpeg</option><option>image/png</option><option>image/webp</option><option>image/avif</option></optgroup><optgroup label="Document"><option>application/pdf</option></optgroup></select></label>
 <label>{ar?"الحجم المتوقع بالبايت":"Expected size in bytes"}<input name="byte_size" type="number" min="1" max="5368709120" required placeholder="10485760"/></label>
 <button className="creator-submit" type="submit">{ar?"تسجيل بيانات الملف":"Register media metadata"} ↗</button></form>
 <p className="creator-muted">{ar?"الحد الحالي لتسجيل البيانات 5 جيجابايت. هذا ليس حدًا نهائيًا لسياسة الرفع، وسيُراجع حسب مزود التخزين والتكلفة.":"The current metadata intake ceiling is 5 GB. This is not a final upload policy and will be revisited with the storage provider and cost model."}</p></section>
 <section className="creator-panel"><h2>{ar?"الوسائط المسجلة على حسابك":"Media registered to your account"}</h2>{assets?.length?assets.map(a=><article className="creator-identity" key={a.id}><strong>{a.asset_kind} · {a.mime_type??"—"}</strong><small>{ar?"الحالة":"State"}: {a.state} · {Number(a.byte_size??0).toLocaleString()} bytes</small></article>):<p className="creator-muted">{ar?"لا توجد وسائط مسجلة بعد.":"No media registered yet."}</p>}</section>
 </main>;
}
