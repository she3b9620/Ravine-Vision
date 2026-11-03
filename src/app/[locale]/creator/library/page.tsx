import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ created?: string; updated?: string; error?: string }> };

export default async function CreatorLibraryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");
  const { data: identities } = await supabase.from("creator_identities").select("id").eq("owner_account_id", user.id);
  const ids = (identities ?? []).map((item)=>item.id);
  const { data: works } = ids.length ? await supabase.from("works").select("id,title,synopsis,kind,status,visibility,created_at").in("creator_identity_id",ids).order("created_at",{ascending:false}) : { data: [] as {id:string;title:string;synopsis:string|null;kind:string;status:string;visibility:string;created_at:string}[] };
  const status: Record<string,string> = ar ? {draft:"مسودة",in_review:"قيد المراجعة",published:"منشور",unlisted:"غير مدرج",rejected:"مرفوض",archived:"مؤرشف"} : {draft:"Draft",in_review:"In review",published:"Published",unlisted:"Unlisted",rejected:"Rejected",archived:"Archived"};
  return <main className="creator-screen" dir={ar?"rtl":"ltr"}>
    <header className="creator-header"><Link className="rv-logo" href={"/"+locale}>RAVINE<span>.</span></Link><nav><Link href={"/"+locale+"/creator"}>{ar?"مساحة المبدع":"Creator space"}</Link><Link href={"/"+locale+"/creator/studio"}>{ar?"الاستوديو":"Studio"}</Link></nav></header>
    <section className="creator-intro"><p className="rv-eyebrow"><i/>WORK LIBRARY</p><h1>{ar?"مكتبة أعمالك.":"Your work library."}</h1><p>{ar?"مساحة خاصة لمتابعة مسوداتك وأعمالك وحالاتها. لا يظهر أي عمل للجمهور قبل اكتمال مسار النشر المعتمد.":"A private space for your drafts, works, and their status. Nothing becomes public before the publishing workflow is approved."}</p></section>
    {query.created && <p className="creator-alert success" role="status">{ar?"تم حفظ المسودة.":"Draft saved."}</p>}{query.updated && <p className="creator-alert success" role="status">{ar?"تم تحديث المسودة.":"Draft updated."}</p>}{query.error && <p className="creator-alert" role="alert">{ar?"تعذر تنفيذ العملية المطلوبة.":"The requested action could not be completed."}</p>}
    <section className="creator-panel"><div className="creator-library-heading"><h2>{ar?"كل الأعمال":"All works"} <span>({works?.length ?? 0})</span></h2><Link href={"/"+locale+"/creator/studio"}>{ar?"إنشاء عمل جديد":"Create new work"} ↗</Link></div>
      {works?.length ? <div className="creator-work-list">{works.map((work)=><article className="creator-identity" key={work.id}><div><h3>{work.title}</h3><small>{work.kind.replaceAll("_"," ")}</small></div><p>{work.synopsis || (ar?"لا توجد نبذة بعد.":"No synopsis yet.")}</p><small>{ar?"الحالة":"Status"}: {status[work.status]??work.status} · {ar?"الظهور":"Visibility"}: {work.visibility}</small>{work.status==="draft" && <Link className="creator-inline-link" href={"/"+locale+"/creator/library/"+work.id+"/edit"}>{ar?"تعديل المسودة":"Edit draft"} ↗</Link>}</article>)}</div> : <p className="creator-muted">{ar?"لا توجد أعمال بعد. ابدأ بإنشاء أول مسودة.":"No works yet. Create your first draft."}</p>}
    </section>
  </main>;
}