import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import CommunityMembershipButton from "@/components/community-membership-button";
import {
  approveMembershipAction,
  rejectMembershipAction,
} from "./actions";
import { VISIBILITY_LABELS, type EntryQuestion } from "@/lib/community";

export const dynamic = "force-dynamic";

type CreatorRef = { id: string; display_name: string; handle: string | null };
type CommunityData = {
  id: string;
  name: string;
  description: string | null;
  guidelines: string | null;
  visibility: string;
  entry_questions: EntryQuestion[] | null;
  created_at: string;
  creator_identities: CreatorRef | CreatorRef[] | null;
};

function creatorOf(community: CommunityData) {
  const creator = community.creator_identities;
  if (!creator) return null;
  return Array.isArray(creator) ? creator[0] ?? null : creator;
}

function visibilityLabel(visibility: string | null, ar: boolean) {
  const key = (visibility ?? "public") as keyof typeof VISIBILITY_LABELS;
  const label = VISIBILITY_LABELS[key] ?? VISIBILITY_LABELS.public;
  return ar ? label.ar : label.en;
}

export default async function CommunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; communityId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, communityId } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  let community: CommunityData | null = null;
  let memberCount = 0;
  let userLoggedIn = false;
  let membershipStatus: string | null = null;
  let isOwner = false;
  let pendingRequests: { accountId: string; status: string; createdAt: string | null; label: string }[] = [];

  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data: userRes } = await supabase.auth.getUser();
      userLoggedIn = !!userRes.user;

      const { data: comRes } = await supabase
        .from("communities")
        .select("id,name,description,guidelines,visibility,entry_questions,created_at,creator_identities(id,display_name,handle)")
        .eq("id", communityId)
        .maybeSingle();

      community = comRes as CommunityData | null;

      if (community) {
        const { count } = await supabase
          .from("community_memberships")
          .select("account_id", { count: "exact", head: true })
          .eq("community_id", communityId)
          .eq("status", "active");

        memberCount = count ?? 0;

        if (userRes.user) {
          const { data: myMem } = await supabase
            .from("community_memberships")
            .select("status")
            .eq("community_id", communityId)
            .eq("account_id", userRes.user.id)
            .maybeSingle();

          membershipStatus = myMem?.status ?? null;

          // Owner check via creator identity
          const creator = creatorOf(community);
          if (creator && creator.id) {
            const { data: identity } = await supabase
              .from("creator_identities")
              .select("owner_account_id")
              .eq("id", creator.id)
              .maybeSingle();
            isOwner = identity?.owner_account_id === userRes.user.id;
          }

          // Pending membership requests for owner approval
          if (isOwner) {
            const { data: pending } = await supabase
              .from("community_memberships")
              .select("account_id, status, created_at")
              .eq("community_id", communityId)
              .eq("status", "requested");

            if (pending && pending.length > 0) {
              const accountIds = pending.map((p) => p.account_id);
              const { data: people } = await supabase
                .from("profiles")
                .select("id, display_name, handle")
                .in("id", accountIds);

              const labelById = new Map(
                (people ?? []).map((person) => [
                  person.id,
                  person.handle ? `@${person.handle}` : person.display_name || person.id.slice(0, 8),
                ]),
              );

              pendingRequests = pending.map((p) => ({
                accountId: p.account_id,
                status: p.status,
                createdAt: p.created_at,
                label: labelById.get(p.account_id) ?? p.account_id.slice(0, 8),
              }));
            }
          }
        }
      }
    } catch {
      community = null;
    }
  }

  if (!community) notFound();
  const creator = creatorOf(community);
  const hasEntryQuestions = Array.isArray(community.entry_questions) && community.entry_questions.length > 0;

  return (
    <main className="simple-page community-detail-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}/communities`}>
        {ar ? "← كل المجتمعات" : "← All Communities"}
      </Link>

      <section className="community-header">
        <p className="eyebrow">RAVINE / COMMUNITY</p>
        <h1>{community.name}</h1>
        {creator && (
          <p className="community-creator-ref">
            {ar ? "بإشراف: " : "Led by: "}
            <Link href={`/${locale}/creators/${creator.id}`}>
              {creator.handle ? "@" + creator.handle : creator.display_name}
            </Link>
          </p>
        )}
        <div className="community-meta-bar">
          <span>{ar ? `الأعضاء: ${memberCount}` : `Members: ${memberCount}`}</span>
          <span className="privacy-badge">{visibilityLabel(community.visibility, ar)}</span>
          {hasEntryQuestions && (
            <span className="entry-badge">
              {ar ? "اختبار دخول مطلوب" : "Entry quiz required"}
            </span>
          )}
        </div>
      </section>

      <section className="community-body">
        <p className="community-description">
          {community.description || (ar ? "مجتمع فكري وإبداعي داخل رافين." : "A cultural and creative community on RAVINE.")}
        </p>

        {community.guidelines && (
          <div className="community-guidelines">
            <h2>{ar ? "ميثاق المجتمع وقواعده" : "Community Charter & Guidelines"}</h2>
            <p>{community.guidelines}</p>
          </div>
        )}

        {hasEntryQuestions && community.entry_questions && (
          <div className="community-entry-note">
            <h3>{ar ? "اختبار الدخول" : "Entry Quiz"}</h3>
            <p>
              {ar
                ? "يُطلب اجتياز اختبار قصير قبل إرسال طلب الانضمام، للتأكد من فهم طبيعة المجتمع وقواعده."
                : "A short quiz is required before sending a join request, to ensure understanding of the community and its rules."}
            </p>
            <ul>
              {community.entry_questions.map((q) => (
                <li key={q.id}>{q.question}</li>
              ))}
            </ul>
          </div>
        )}

        {query.error === "membership" && (
          <p className="community-request-note" role="alert">
            {ar ? "تعذر تحديث عضوية المجتمع. حاول مرة أخرى." : "Could not update community membership. Try again."}
          </p>
        )}

        <div className="community-actions">
          <CommunityMembershipButton
            communityId={community.id}
            locale={locale}
            isAuthenticated={userLoggedIn}
            membershipStatus={membershipStatus}
            hasEntryQuestions={hasEntryQuestions}
            isOwner={isOwner}
          />
        </div>

        {isOwner && pendingRequests.length > 0 && (
          <section className="community-owner-approvals">
            <h3>{ar ? "طلبات الانضمام قيد الموافقة" : "Pending Membership Requests"}</h3>
            <p>
              {ar
                ? "اطلب من العضو الإجابة على أسئلة الدخول أولاً، ثم اقبل أو ارفض الطلب."
                : "Ask the member to complete the entry quiz first, then approve or reject the request."}
            </p>
            <ul className="pending-requests-list">
              {pendingRequests.map((req) => (
                <li key={req.accountId} className="pending-request-item">
                  <span>{req.label}</span>
                  <div className="pending-request-actions">
                    <form action={approveMembershipAction} style={{ display: "inline" }}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="community_id" value={communityId} />
                      <input type="hidden" name="account_id" value={req.accountId} />
                      <button
                        type="submit"
                        className="approve-button"
                      >
                        {ar ? "قبول" : "Approve"}
                      </button>
                    </form>
                    <form action={rejectMembershipAction} style={{ display: "inline" }}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="community_id" value={communityId} />
                      <input type="hidden" name="account_id" value={req.accountId} />
                      <button
                        type="submit"
                        className="reject-button"
                      >
                        {ar ? "رفض" : "Reject"}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="community-request-note">
          {ar
            ? "الانضمام يُسجَّل كطلب. صاحب المجتمع له الحق في قبول أو رفض الطلبات. لا يمنح النظام العضوية النشطة تلقائيًا."
            : "Membership is recorded as a request. The community owner has the right to approve or reject requests. The system does not self-activate members."}
        </p>
      </section>

      <footer className="community-footer">
        <Link className="report-link" href={`/${locale}/report?target_type=community&target_id=${community.id}`}>
          {ar ? "إبلاغ عن هذا المجتمع ↗" : "Report this community ↗"}
        </Link>
      </footer>
    </main>
  );
}
