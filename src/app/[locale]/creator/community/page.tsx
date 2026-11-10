import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { EmptyState } from "@/components/empty-state";
import EntryQuizBuilder from "@/components/entry-quiz-builder";
import { VISIBILITY_LABELS, type CommunityVisibility } from "@/lib/community";
import { createCommunity } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; created?: string }>;
};

type CommunityRow = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  owner_creator_identity_id: string | null;
};

export default async function CreatorCommunityPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);

  const { data: identities } = await supabase
    .from("creator_identities")
    .select("id,display_name,handle,status")
    .eq("owner_account_id", user.id)
    .order("created_at", { ascending: false });

  const ownedIds = (identities ?? []).map((identity) => identity.id);
  const { data: communities } = ownedIds.length
    ? await supabase
        .from("communities")
        .select("id,name,description,visibility,owner_creator_identity_id")
        .in("owner_creator_identity_id", ownedIds)
        .order("created_at", { ascending: false })
    : { data: [] as CommunityRow[] };

  const rows = (communities ?? []) as CommunityRow[];
  const activeIdentities = (identities ?? []).filter((identity) => identity.status === "active");
  const identityName = new Map((identities ?? []).map((identity) => [identity.id, identity.display_name]));
  const errors: Record<string, string> = ar
    ? {
        validation: "راجع اسم المجتمع والوصف وميثاقه.",
        identity: "إنشاء المجتمع متاح فقط لهوية إبداعية نشطة ومعتمدة تابعة لحسابك.",
        quiz: "تعذر حفظ أسئلة الدخول. راجع الأسئلة والإجابات وحاول مرة أخرى.",
        save: "تعذر إنشاء المجتمع. حاول مرة أخرى.",
      }
    : {
        validation: "Check the community name, description, and guidelines.",
        identity: "Community creation requires an active, approved creative identity owned by your account.",
        quiz: "Could not save the entry quiz. Check the questions and answers and try again.",
        save: "Could not create the community. Try again.",
      };

  return (
    <main className="rv-settings-page" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>
          <Link href={"/" + locale + "/creator"}>{ar ? "مساحة المبدع" : "Creator Space"}</Link>
          <Link href={"/" + locale + "/creator/library"}>{ar ? "الأعمال" : "Works"}</Link>
          <Link href={"/" + locale + "/communities"}>{ar ? "المجتمعات" : "Communities"}</Link>
        </nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow"><i />CREATOR COMMUNITY</p>
        <h1>{ar ? "مجتمعاتك." : "Your communities."}</h1>
        <p>
          {ar
            ? "أنشئ مجتمعًا حول عمل أو اهتمام إبداعي، واختر مستواه: عام، أو خاص قابل للاكتشاف، أو دعوة فقط. الحوكمة والأدوار الإدارية تبقى قرارات مفتوحة."
            : "Create a community around a work or creative interest and choose its level: public, discoverable-private, or invite-only. Governance and moderator roles remain OPEN decisions."}
        </p>
      </section>

      {query.created && <p className="creator-alert success" role="status">{ar ? "تم إنشاء المجتمع." : "Community created."}</p>}
      {query.error && <p className="creator-alert" role="alert">{errors[query.error] ?? (ar ? "تعذر تنفيذ العملية." : "The action could not be completed.")}</p>}

      {identities && identities.length === 0 ? (
        <EmptyState
          locale={locale}
          title={ar ? "لا توجد هوية إبداعية" : "No creative identity yet"}
          description={ar ? "أنشئ هوية إبداعية أولاً لإنشاء مجتمع" : "Create a creative identity first to start a community"}
          actionLabel={ar ? "الانتقال لمساحة المبدع" : "Open Creator Space"}
          actionHref={"/" + locale + "/creator"}
        />
      ) : (
        <>
          <section className="creator-panel">
            <h2>{ar ? "إنشاء مجتمع" : "Create a community"}</h2>
            {activeIdentities.length ? (
              <form action={createCommunity} className="creator-form">
                <input type="hidden" name="locale" value={locale} />
                <label>{ar ? "الهوية الإبداعية النشطة" : "Active creative identity"}
                  <select name="creator_identity_id" required defaultValue="">
                    <option value="" disabled>{ar ? "اختر الهوية" : "Choose identity"}</option>
                    {activeIdentities.map((identity) => (
                      <option key={identity.id} value={identity.id}>
                        {identity.display_name} (@{identity.handle})
                      </option>
                    ))}
                  </select>
                </label>
                <label>{ar ? "اسم المجتمع" : "Community name"}
                  <input name="name" required minLength={3} maxLength={80} />
                </label>
                <label>{ar ? "مستوى الخصوصية" : "Privacy level"}
                  <select name="visibility" defaultValue="public">
                    {(["public", "discoverable_private", "invite_only"] as CommunityVisibility[]).map(
                      (visibility) => (
                        <option key={visibility} value={visibility}>
                          {ar ? VISIBILITY_LABELS[visibility].ar : VISIBILITY_LABELS[visibility].en}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>{ar ? "وصف مختصر (اختياري)" : "Short description (optional)"}
                  <textarea name="description" rows={3} maxLength={600} />
                </label>
                <label>{ar ? "ميثاق المجتمع وقواعده (اختياري)" : "Community charter & guidelines (optional)"}
                  <textarea name="guidelines" rows={4} maxLength={2000} />
                </label>
                <div className="entry-quiz-section">
                  <h3>{ar ? "أسئلة الدخول (اختياري)" : "Entry quiz questions (optional)"}</h3>
                  <p className="creator-muted">
                    {ar
                      ? "تظهر أسئلة الدخول للزوار قبل إرسال طلب الانضمام، والإجابات الصحيحة تبقى خاصة."
                      : "Entry questions are shown before a join request is sent; correct answers stay private."}
                  </p>
                  <EntryQuizBuilder locale={locale} />
                </div>
                <p className="creator-muted">
                  {ar
                    ? "المجتمع العام يظهر للجميع. الخاص القابل للاكتشاف يظهر للمستخدمين المسجّلين، ودعوة فقط يظهر للمالك والأعضاء فقط. أصحاب المجتمع يوافقون على طلبات الانضمام دائماً."
                    : "Public communities are visible to everyone, discoverable-private ones to signed-in accounts, and invite-only ones only to the owner and members. Community owners always approve join requests."}
                </p>
                <button className="creator-submit" type="submit">{ar ? "إنشاء المجتمع" : "Create community"} ↗</button>
              </form>
            ) : (
              <p className="creator-muted">
                {ar
                  ? "لا توجد هوية إبداعية نشطة بعد. يفتح إنشاء المجتمعات بعد اعتماد هويتك من المراجعة."
                  : "No active creative identity yet. Community creation opens after your identity is approved through review."}
              </p>
            )}
          </section>

          <section className="creator-panel">
            <h2>{ar ? "مجتمعاتك" : "Your communities"}</h2>
            {rows.length ? (
              <div className="rv-community-cards">
                {rows.map((community) => (
                  <article key={community.id} className="rv-community-card">
                    <div className="rv-community-info">
                      <h3>{community.name}</h3>
                      <p className="rv-community-desc">{community.description ?? ""}</p>
                      <span className="rv-community-visibility">
                        {ar
                          ? (VISIBILITY_LABELS[community.visibility as CommunityVisibility]?.ar ??
                            community.visibility)
                          : (VISIBILITY_LABELS[community.visibility as CommunityVisibility]?.en ??
                            community.visibility)}
                      </span>
                      {community.owner_creator_identity_id && (
                        <small>{ar ? "الهوية: " : "Identity: "}{identityName.get(community.owner_creator_identity_id) ?? "—"}</small>
                      )}
                    </div>
                    <Link href={"/" + locale + "/communities/" + community.id} className="rv-community-link">
                      {ar ? "عرض المجتمع" : "View community"} ↗
                    </Link>
                    <Link
                      href={"/" + locale + "/creator/community/" + community.id + "/quiz"}
                      className="rv-community-link"
                    >
                      {ar ? "إدارة اختبار الدخول" : "Manage entry quiz"} ↗
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="creator-muted">{ar ? "لم تنشئ أي مجتمع بعد." : "You have not created a community yet."}</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
