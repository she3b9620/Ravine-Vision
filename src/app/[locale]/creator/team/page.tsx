import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { inviteCreatorTeamMember, respondToCreatorTeamInvitation, revokeCreatorTeamInvitation, removeCreatorTeamMember } from "./actions";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string; sent?: string; updated?: string }> };

export default async function CreatorTeamPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");

  const { data: identities } = await supabase.from("creator_identities")
    .select("id,display_name,handle").eq("owner_account_id", user.id).order("created_at", { ascending: false });
  const ownedIds = (identities ?? []).map((identity) => identity.id);
  const { data: memberships } = ownedIds.length
    ? await supabase.from("creator_team_memberships").select("creator_identity_id,account_id,role,status,joined_at").in("creator_identity_id", ownedIds).order("joined_at", { ascending: false })
    : { data: [] as {creator_identity_id:string;account_id:string;role:string;status:string;joined_at:string}[] };
  const { data: ownedInvitations } = ownedIds.length
    ? await supabase.from("creator_team_invitations").select("id,creator_identity_id,invited_account_id,role,status,created_at,expires_at").in("creator_identity_id", ownedIds).order("created_at", { ascending: false })
    : { data: [] as {id:string;creator_identity_id:string;invited_account_id:string;role:string;status:string;created_at:string;expires_at:string}[] };
  const { data: receivedInvitationRows } = await supabase.rpc("list_my_pending_creator_team_invitations");
  const receivedInvitations = (receivedInvitationRows ?? []) as {
    invitation_id: string;
    identity_display_name: string;
    identity_handle: string | null;
    invited_role: string;
    invitation_status: string;
    invitation_created_at: string;
    invitation_expires_at: string;
  }[];

  const roleLabel: Record<string,string> = ar
    ? {manager:"مدير فريق",editor:"محرر",analyst:"محلل"}
    : {manager:"Manager",editor:"Editor",analyst:"Analyst"};
  const statusLabel: Record<string,string> = ar
    ? {pending:"بانتظار الرد",accepted:"مقبولة",declined:"مرفوضة",revoked:"ملغاة",expired:"منتهية",active:"نشط",suspended:"موقوف",removed:"أزيل"}
    : {pending:"Pending",accepted:"Accepted",declined:"Declined",revoked:"Revoked",expired:"Expired",active:"Active",suspended:"Suspended",removed:"Removed"};
  const errors: Record<string,string> = ar
    ? {validation:"تحقق من الهوية الإبداعية ومعرّف الحساب والدور.",invite:"تعذر إرسال الدعوة. تأكد من صحة معرّف الحساب وعدم وجود دعوة معلقة.",response:"تعذر تحديث الدعوة. ربما لم تعد معلقة أو لا تخص حسابك.",owner_action:"تعذر تنفيذ الإجراء. تحقق من ملكية الهوية وحالة العضو أو الدعوة."}
    : {validation:"Check the creative identity, account ID, and role.",invite:"Could not send the invitation. Check the account ID and pending invitations.",response:"Could not update the invitation. It may no longer be pending or may not belong to you.",owner_action:"Could not complete the owner action. Check identity ownership and the member or invitation status."};

  return <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
    <header className="creator-header"><Link className="rv-logo" href={"/"+locale}>RAVINE<span>.</span></Link><nav><Link href={"/"+locale+"/creator"}>{ar?"مساحة المبدع":"Creator space"}</Link><Link href={"/"+locale+"/creator/studio"}>{ar?"الاستوديو":"Studio"}</Link><Link href={"/"+locale+"/creator/library"}>{ar?"الأعمال":"Works"}</Link></nav></header>
    <section className="creator-intro"><p className="rv-eyebrow"><i/>CREATOR TEAM</p><h1>{ar?"فريقك الإبداعي.":"Your creative team."}</h1><p>{ar?"أدر دعوات التعاون والعضويات المرتبطة بهوياتك الإبداعية. صلاحيات الأدوار التفصيلية لن تُفعّل قبل اعتماد مصفوفة الصلاحيات.":"Manage collaboration invitations and memberships attached to your creative identities. Detailed role permissions remain inactive until the permission matrix is approved."}</p></section>
    {query.error && <p className="creator-alert" role="alert">{errors[query.error] ?? (ar?"تعذر تنفيذ العملية.":"The action could not be completed.")}</p>}
    {query.sent && <p className="creator-alert success" role="status">{ar?"تم إرسال الدعوة.":"Invitation sent."}</p>}
    {query.updated && <p className="creator-alert success" role="status">{ar?"تم تحديث حالة الدعوة.":"Invitation updated."}</p>}

    <section className="creator-panel creator-team-section"><h2>{ar?"دعوات واردة إليك":"Invitations to you"}</h2>
      {receivedInvitations?.length ? receivedInvitations.map((invitation)=><article className="creator-identity" key={invitation.invitation_id}>
        <strong>{invitation.identity_display_name ?? (ar?"هوية إبداعية":"Creative identity")}</strong>
        <small>{invitation.identity_handle ? "@"+invitation.identity_handle+" · " : ""}{roleLabel[invitation.invited_role] ?? invitation.invited_role}</small>
        <small>{statusLabel[invitation.invitation_status] ?? invitation.invitation_status} · {ar?"تنتهي":"Expires"}: {new Date(invitation.invitation_expires_at).toLocaleString(ar?"ar-EG":"en-GB")}</small>
        {invitation.invitation_status === "pending" && <form action={respondToCreatorTeamInvitation} className="creator-team-actions"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="invitation_id" value={invitation.invitation_id}/><button name="decision" value="accepted" className="creator-submit">{ar?"قبول الدعوة":"Accept"}</button><button name="decision" value="declined" className="creator-review-reject">{ar?"رفض":"Decline"}</button></form>}
      </article>) : <p className="creator-muted">{ar?"لا توجد دعوات معلقة.":"No pending invitations."}</p>}
    </section>

    <div className="creator-columns creator-team-columns">
      <section className="creator-panel"><h2>{ar?"إرسال دعوة جديدة":"Send an invitation"}</h2>
        {identities?.length ? <form action={inviteCreatorTeamMember} className="creator-form">
          <input type="hidden" name="locale" value={locale}/>
          <label>{ar?"الهوية الإبداعية":"Creative identity"}<select name="creator_identity_id" required defaultValue=""><option value="" disabled>{ar?"اختر الهوية":"Choose identity"}</option>{identities.map((identity)=><option key={identity.id} value={identity.id}>{identity.display_name} (@{identity.handle})</option>)}</select></label>
          <label>{ar?"معرّف حساب العضو على RAVINE":"Invitee RAVINE account UUID"}<input name="invited_account_id" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required/></label>
          <label>{ar?"الدور المقترح":"Proposed role"}<select name="role" defaultValue="editor"><option value="manager">{roleLabel.manager}</option><option value="editor">{roleLabel.editor}</option><option value="analyst">{roleLabel.analyst}</option></select></label>
          <p className="creator-muted">{ar?"نستخدم معرّف الحساب حاليًا بدل البحث بالبريد الإلكتروني؛ لا تكشف معرّفات الحسابات علنًا.":"Account UUID is used instead of email lookup for now. Do not share account IDs publicly."}</p>
          <button className="creator-submit" type="submit">{ar?"إرسال الدعوة":"Send invitation"} <span>↗</span></button>
        </form> : <p className="creator-muted">{ar?"أنشئ هوية إبداعية أولًا لإدارة فريقها.":"Create a creative identity before managing its team."}</p>}
      </section>
      <section className="creator-panel"><h2>{ar?"الفرق والعضويات":"Teams and memberships"}</h2>
        {identities?.length ? identities.map((identity)=><article className="creator-identity" key={identity.id}><h3>{identity.display_name}</h3><span>@{identity.handle}</span>
          {(memberships ?? []).filter((member)=>member.creator_identity_id===identity.id).map((member)=><div className="creator-identity" key={member.account_id}><p>{member.account_id} — {roleLabel[member.role]??member.role} · {statusLabel[member.status]??member.status}</p>{member.status==="active"&&<form action={removeCreatorTeamMember} className="creator-team-actions"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="creator_identity_id" value={identity.id}/><input type="hidden" name="member_account_id" value={member.account_id}/><button className="creator-review-reject" type="submit">{ar?"إزالة العضو":"Remove member"}</button></form>}</div>)}
          {(ownedInvitations ?? []).filter((invitation)=>invitation.creator_identity_id===identity.id).map((invitation)=><div className="creator-identity" key={invitation.id}><p>{invitation.invited_account_id} — {roleLabel[invitation.role]??invitation.role} · {statusLabel[invitation.status]??invitation.status}</p><small>{ar?"تنتهي":"Expires"}: {new Date(invitation.expires_at).toLocaleString(ar?"ar-EG":"en-GB")}</small>{invitation.status==="pending"&&<form action={revokeCreatorTeamInvitation} className="creator-team-actions"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="invitation_id" value={invitation.id}/><button className="creator-review-reject" type="submit">{ar?"إلغاء الدعوة":"Revoke invitation"}</button></form>}</div>)}
          {!memberships?.some((member)=>member.creator_identity_id===identity.id) && !ownedInvitations?.some((invitation)=>invitation.creator_identity_id===identity.id) && <p className="creator-muted">{ar?"لا يوجد أعضاء أو دعوات بعد.":"No members or invitations yet."}</p>}
        </article>) : <p className="creator-muted">{ar?"لا توجد هويات إبداعية.":"No creative identities."}</p>}
      </section>
    </div>
    <p className="creator-disclaimer">{ar?"العضوية لا تمنح حاليًا صلاحية تعديل الأعمال أو الوسائط أو الحقوق أو الإيرادات. ستُضاف الصلاحيات بعد اعتماد سياسة واضحة لكل دور.":"Membership currently grants no ability to edit works, media, rights, or earnings. Capabilities will be added only after a clear per-role policy is approved."}</p>
  </main>;
}
