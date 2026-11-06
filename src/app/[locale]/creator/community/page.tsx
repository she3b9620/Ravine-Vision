import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }> };

export default async function CreatorCommunityPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");

  const { data: identities } = await supabase
    .from("creator_identities")
    .select("id,display_name,handle")
    .eq("owner_account_id", user.id)
    .order("created_at", { ascending: false });

  const ownedIds = (identities ?? []).map((i) => i.id);
  const { data: communities } = ownedIds.length
    ? await supabase
        .from("communities")
        .select("id,name,description,visibility")
        .eq("owner_creator_identity_id", ownedIds[0])
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="rv-settings-page" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          RAVINE<span>.</span>
        </Link>
        <nav>
          <Link href={"/" + locale + "/creator"}>{ar ? "مساحة المبدع" : "Creator Space"}</Link>
          <Link href={"/" + locale + "/creator/library"}>{ar ? "الأعمال" : "Works"}</Link>
        </nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow"><i />CREATOR COMMUNITY</p>
        <h1>{ar ? " مجتمع حول العمل" : "Community around your work"}</h1>
        <p>
          {ar
            ? "أدر مجتمعك، واعرف من ينضم، وحدد القواعد والخصوصية."
            : "Manage your community, track members, and set the rules and privacy."}
        </p>
      </section>

      {identities && identities.length === 0 ? (
        <EmptyState
          locale={locale}
          title={ar ? "لا توجد هوية إبداعية" : "No creative identity yet"}
          description={ar ? "أنشئ هوية إبداعية أولاً لإنشاء مجتمع" : "Create a creative identity first to start a community"}
          actionLabel={ar ? "الانتقال لمساحة المبدع" : "Open Creator Space"}
          actionHref={"/" + locale + "/creator"}
        />
      ) : (
        <section className="creator-panel">
          <h2>{ar ? " مجتمعاتك" : "Your communities"}</h2>
          {communities && communities.length > 0 ? (
            <div className="rv-community-cards">
              {communities.map((community) => (
                <article key={community.id} className="rv-community-card">
                  <div className="rv-community-info">
                    <h3>{community.name}</h3>
                    <p className="rv-community-desc">{community.description ?? ""}</p>
                    <span className="rv-community-visibility">{community.visibility}</span>
                  </div>
                  <Link href={"/" + locale + "/communities/" + community.id} className="rv-community-link">
                    {ar ? "管理" : "Manage"} ↗
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              locale={locale}
              title={ar ? "لا توجد مجتمعات" : "No communities yet"}
              description={ar ? "لم تنشئ أي مجتمع بعد" : "You haven't created any communities yet"}
            />
          )}
        </section>
      )}
    </main>
  );
}