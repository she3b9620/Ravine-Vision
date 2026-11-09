import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import CommunityMembershipButton from "@/components/community-membership-button";

export const dynamic = "force-dynamic";

type CreatorRef = { id: string; display_name: string; handle: string | null };
type CommunityData = {
  id: string;
  name: string;
  description: string | null;
  guidelines: string | null;
  visibility: string;
  created_at: string;
  creator_identities: CreatorRef | CreatorRef[] | null;
};

function creatorOf(community: CommunityData) {
  const creator = community.creator_identities;
  if (!creator) return null;
  return Array.isArray(creator) ? creator[0] ?? null : creator;
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

  if (getSupabaseEnvironment()) {
    try {
      const supabase = await createClient();
      const { data: userRes } = await supabase.auth.getUser();
      userLoggedIn = !!userRes.user;

      const { data: comRes } = await supabase
        .from("communities")
        .select("id,name,description,guidelines,visibility,created_at,creator_identities(id,display_name,handle)")
        .eq("id", communityId)
        .eq("visibility", "public")
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
        }
      }
    } catch {
      community = null;
    }
  }

  if (!community) notFound();
  const creator = creatorOf(community);

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

        <div className="community-meta-bar">
          <span>{ar ? `الأعضاء: ${memberCount}` : `Members: ${memberCount}`}</span>
          <span>{ar ? "مستوى الخصوصية: عام" : "Privacy: Public"}</span>
        </div>

        {query.error === "membership" && (
          <p className="community-request-note" role="alert">
            {ar
              ? "تعذر تحديث عضوية المجتمع. حاول مرة أخرى."
              : "Could not update community membership. Try again."}
          </p>
        )}

        <div className="community-actions">
          <CommunityMembershipButton
            communityId={community.id}
            locale={locale}
            isAuthenticated={userLoggedIn}
            membershipStatus={membershipStatus}
          />
        </div>
        <p className="community-request-note">
          {ar
            ? "الانضمام يُسجَّل كطلب. لا يمنح النظام العضوية النشطة تلقائيًا؛ مسار موافقة المالك لم يُعتمد بعد."
            : "Membership is recorded as a request. The system does not self-activate members; owner approval is not approved yet."}
        </p>
      </section>

      <footer className="community-footer">
        <Link className="report-link" href={`/${locale}/report?subject_type=community&subject_id=${community.id}`}>
          {ar ? "إبلاغ عن هذا المجتمع ↗" : "Report this community ↗"}
        </Link>
      </footer>
    </main>
  );
}
