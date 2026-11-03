import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "../auth/actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, bio, account_tier, preferred_locale, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name || String(user.user_metadata?.display_name ?? "") || (ar ? "عضو رَافِين" : "RAVINE member");
  const tierLabels: Record<string, string> = ar
    ? { viewer: "مشاهد", creator: "مبدع", verified: "مبدع موثّق", select: "Select" }
    : { viewer: "Viewer", creator: "Creator", verified: "Verified creator", select: "Select" };

  return (
    <main className="profile-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="profile-top">
        <Link className="rv-logo" href={"/" + locale}>RAVINE<span>.</span></Link>
        <Link href={"/" + (ar ? "en" : "ar") + "/profile"}>{ar ? "English" : "العربية"}</Link>
      </header>
      <div className="profile-grid">
        <section className="profile-main">
          <p className="rv-eyebrow"><i />PERSONAL UNIVERSE</p>
          <h1>{ar ? "مساحتك الشخصية." : "Your personal universe."}</h1>
          <p>{ar ? "هنا تبدأ علاقتك برَافِين: هويتك، اهتماماتك، الأعمال التي تحفظها، والمجتمعات التي تختار الانضمام إليها." : "This is where your relationship with RAVINE takes shape: your identity, interests, saved works, and the communities you choose to join."}</p>
          <div className="profile-actions">
            <Link href={"/" + locale + "/discover"}>{ar ? "اكتشف الأعمال" : "Discover works"} <span>↗</span></Link>
            <Link href={"/" + locale + "/works"}>{ar ? "مكتبتي والأعمال" : "My library & works"} <span>↗</span></Link>
            <Link href={"/" + locale + "/communities"}>{ar ? "المجتمعات" : "Communities"} <span>↗</span></Link>
            <Link href={"/" + locale + "/creator"}>{ar ? "مساحة المبدع" : "Creator Space"} <span>↗</span></Link>
          </div>
        </section>
        <aside className="profile-card">
          <div className="profile-avatar" aria-hidden="true">{displayName.trim().charAt(0).toUpperCase() || "R"}</div>
          <h2>{displayName}</h2>
          <div className="profile-meta">
            <small>{ar ? "البريد الإلكتروني" : "Email address"}</small>
            <span>{user.email}</span>
            <small>{ar ? "نوع الحساب" : "Account tier"}</small>
            <span>{tierLabels[profile?.account_tier ?? "viewer"] ?? tierLabels.viewer}</span>
            {profile?.handle && <><small>{ar ? "اسم المستخدم" : "Handle"}</small><span>@{profile.handle}</span></>}
          </div>
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale}/>
            <div className="profile-actions"><button type="submit">{ar ? "تسجيل الخروج" : "Sign out"} <span>↗</span></button></div>
          </form>
          <p className="profile-note">{ar ? "بعض أدوات الملف الشخصي وإعدادات الخصوصية ستظهر هنا بعد استكمال طبقة الحسابات. لا يتم تفعيل أي ترقية أو استحقاق مالي تلقائيًا." : "Profile tools and privacy settings will appear here as the account layer is completed. No tier upgrade or financial entitlement is activated automatically."}</p>
        </aside>
      </div>
    </main>
  );
}
