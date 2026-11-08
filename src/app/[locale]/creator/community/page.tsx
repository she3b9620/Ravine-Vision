import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { EmptyState } from "@/components/empty-state";
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
        save: "تعذر إنشاء المجتمع. حاول مرة أخرى.",
      }
    : {
        validation: "Check the community name, description, and guidelines.",
        identity: "Community creation requires an active, approved creative identity owned by your account.",
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
        <h1>{ar ? "مجتمعاتك العامة." : "Your public communities."}</h1>
        <p>
          {ar
            ? "أنشئ مجتمعًا عامًا حول عمل أو اهتمام إبداعي. مستويات الخصوصية والحوكمة والأدوار الإدارية تبقى قرارات مفتوحة، وقد تتوسع المؤسسة تدريجيًا."
            : "Create a public community around a work or creative interest. Privacy levels, governance, and moderator roles remain OPEN decisions, and this foundation may expand gradually."}
        </p>
      </section>

      {query.created && <p className="creator-alert success" role="status">{ar ? "تم إنشاء المجتمع العام." : "Public community created."}</p>}
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
            <h2>{ar ? "إنشاء مجتمع عام" : "Create a public community"}</h2>
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
                <label>{ar ? "وصف مختصر (اختياري)" : "Short description (optional)"}
                  <textarea name="description" rows={3} maxLength={600} />
                </label>
                <label>{ar ? "ميثاق المجتمع وقواعده (اختياري)" : "Community charter & guidelines (optional)"}
                  <textarea name="guidelines" rows={4} maxLength={2000} />
                </label>
                <p className="creator-muted">
                  {ar
                    ? "يُنشأ المجتمع عامًا ويظهر في دليل المجتمعات. لا يمكن حاليًا تغيير مستواه إلى خاص أو دعوة فقط؛ هذه السياسة لم تُعتمد بعد."
                    : "The community is created as public and appears in the community directory. Changing it to private or invite-only is not available yet; that policy has not been approved."}
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
                      <span className="rv-community-visibility">{community.visibility}</span>
                      {community.owner_creator_identity_id && (
                        <small>{ar ? "الهوية: " : "Identity: "}{identityName.get(community.owner_creator_identity_id) ?? "—"}</small>
                      )}
                    </div>
                    <Link href={"/" + locale + "/communities/" + community.id} className="rv-community-link">
                      {ar ? "عرض المجتمع" : "View community"} ↗
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
