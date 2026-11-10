import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { WORK_KIND_LABELS, WORK_VISIBILITY_LABELS, labelFor } from "@/lib/labels";
import { submitWorkForReview } from "./actions";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ created?: string; updated?: string; submitted?: string; error?: string; identity?: string }> };

export default async function CreatorLibraryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);
  const { data: identities } = await supabase.from("creator_identities").select("id,display_name,handle,status").eq("owner_account_id", user.id).order("created_at",{ascending:false});
  const ids = (identities ?? []).map((item)=>item.id);
  const selectedIdentity = ids.includes(query.identity ?? "") ? query.identity! : "";
  const visibleIds = selectedIdentity ? [selectedIdentity] : ids;
  const { data: works } = visibleIds.length ? await supabase.from("works").select("id,creator_identity_id,title,synopsis,kind,status,visibility,review_notes,reviewed_at,created_at").in("creator_identity_id",visibleIds).order("created_at",{ascending:false}) : { data: [] as {id:string;creator_identity_id:string;title:string;synopsis:string|null;kind:string;status:string;visibility:string;review_notes:string|null;reviewed_at:string|null;created_at:string}[] };
  const status: Record<string,string> = ar ? {draft:"مسودة",in_review:"قيد المراجعة",published:"منشور",unlisted:"غير مدرج",rejected:"مرفوض",archived:"مؤرشف"} : {draft:"Draft",in_review:"In review",published:"Published",unlisted:"Unlisted",rejected:"Rejected",archived:"Archived"};
  const errors: Record<string,string> = ar
    ? { validation:"راجع البيانات المطلوبة.", submit:"تعذر إرسال العمل للمراجعة. تأكد أن الهوية الإبداعية نشطة وأن العمل ما زال مسودة." }
    : { validation:"Check the required fields.", submit:"The work could not be submitted for review. Confirm the creative identity is active and the work is still a draft." };
  return <main className="creator-screen" dir={ar?"rtl":"ltr"}>
    <header className="creator-header"><Link className="rv-logo" href={"/"+locale}><i className="rv-logo-wordmark" role="img" aria-label="RAVINE" /></Link><nav><Link href={"/"+locale+"/creator"}>{ar?"مساحة المبدع":"Creator space"}</Link><Link href={"/"+locale+"/creator/studio"}>{ar?"الاستوديو":"Studio"}</Link></nav></header>
    <section className="creator-intro"><p className="rv-eyebrow"><i/>WORK LIBRARY</p><h1>{ar?"مكتبة أعمالك.":"Your work library."}</h1><p>{ar?"مساحة خاصة لمتابعة مسوداتك وأعمالك وحالاتها. يظهر العمل للجمهور فقط بعد اعتماده من المراجعة ونشره علنًا.":"A private space for your drafts, works, and their status. A work becomes public only after review approval and public publication."}</p></section>
    {query.created && <p className="creator-alert success" role="status">{ar?"تم حفظ المسودة.":"Draft saved."}</p>}{query.updated && <p className="creator-alert success" role="status">{ar?"تم تحديث المسودة.":"Draft updated."}</p>}{query.submitted && <p className="creator-alert success" role="status">{ar?"تم إرسال العمل للمراجعة.":"The work was submitted for review."}</p>}{query.error && <p className="creator-alert" role="alert">{errors[query.error]??(ar?"تعذر تنفيذ العملية المطلوبة.":"The requested action could not be completed.")}</p>}
    <section className="creator-panel"><div className="creator-library-heading"><h2>{ar?"كل الأعمال":"All works"} <span>({works?.length ?? 0})</span></h2><Link href={"/"+locale+"/creator/studio"}>{ar?"إنشاء عمل جديد":"Create new work"} ↗</Link></div>
      {identities?.length ? <nav className="creator-team-actions" aria-label={ar?"تصفية حسب الهوية":"Filter by identity"}><Link className="creator-inline-link" href={"/"+locale+"/creator/library"}>{ar?"كل الهويات":"All identities"}</Link>{identities.map((identity)=><Link className="creator-inline-link" key={identity.id} href={"/"+locale+"/creator/library?identity="+identity.id}>{identity.display_name}</Link>)}</nav> : null}
      {works?.length ? <div className="creator-work-list">{works.map((work)=>{const identity=identities?.find((item)=>item.id===work.creator_identity_id);const canSubmit=work.status==="draft"&&identity?.status==="active";return <article className="creator-identity" key={work.id}>
        <div><h3>{work.title}</h3><small>{labelFor(WORK_KIND_LABELS,work.kind,locale)}</small></div>
        <p>{work.synopsis || (ar?"لا توجد نبذة بعد.":"No synopsis yet.")}</p>
        <small>{ar?"الهوية":"Identity"}: {identity?.display_name ?? work.creator_identity_id}</small>
        <small>{ar?"الحالة":"Status"}: {status[work.status]??work.status} · {ar?"الظهور":"Visibility"}: {labelFor(WORK_VISIBILITY_LABELS,work.visibility,locale)}</small>
        {work.status==="draft"&&work.review_notes && <p className="creator-review-note"><strong>{ar?"ملاحظات المراجعة:":"Review notes:"}</strong> {work.review_notes}</p>}
        {work.status==="in_review" && <small>{ar?"بانتظار قرار المراجعة. لا يمكن تعديل العمل أثناء المراجعة.":"Awaiting a review decision. The work cannot be edited while in review."}</small>}
        <div className="creator-team-actions">
          {work.status==="draft" && <Link className="creator-inline-link" href={"/"+locale+"/creator/library/"+work.id+"/edit"}>{ar?"تعديل المسودة":"Edit draft"} ↗</Link>}
          {work.status==="draft" && (canSubmit ? <form action={submitWorkForReview}><input type="hidden" name="locale" value={locale}/><input type="hidden" name="work_id" value={work.id}/><button className="creator-review-reject" type="submit">{ar?"إرسال للمراجعة":"Submit for review"}</button></form> : <small>{ar?"فعّل الهوية الإبداعية أولًا لتتمكن من إرسال العمل للمراجعة.":"Activate the creative identity before submitting this work for review."}</small>)}
          {work.status==="published" && work.visibility==="public" && <Link className="creator-inline-link" href={"/"+locale+"/works/"+work.id}>{ar?"عرض العمل المنشور":"View published work"} ↗</Link>}
        </div>
      </article>})}</div> : <p className="creator-muted">{ar?"لا توجد أعمال بعد. ابدأ بإنشاء أول مسودة.":"No works yet. Create your first draft."}</p>}
    </section>
  </main>;
}
