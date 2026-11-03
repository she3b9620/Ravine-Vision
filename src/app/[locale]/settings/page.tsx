import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");

  return (
    <main className="rv-settings-page" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          RAVINE<span>.</span>
        </Link>
        <nav>
          <Link href={"/" + locale + "/profile"}>{ar ? "حسابي" : "Profile"}</Link>
          <Link href={"/" + locale + "/creator"}>{ar ? "المبدع" : "Creator"}</Link>
        </nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow"><i />ACCOUNT SETTINGS</p>
        <h1>{ar ? "إعدادات الحساب" : "Account settings"}</h1>
        <p>
          {ar
            ? "تحكم في اللغة، الخصوصية، الأمان، وإعدادات المفضلات."
            : "Control your language, privacy, security, and preferences."}
        </p>
      </section>

      <section className="creator-panel">
        <div className="creator-settings-section">
          <h2>{ar ? "اللغة والوضع" : "Language & Appearance"}</h2>
          <p className="creator-muted">
            {ar
              ? "تبديل بين العربية والإنجليزية، وتغيير وضع العرض (فاتح/مظلم)."
              : "Switch between Arabic and English, and change display mode (light/dark)."}
          </p>
          <div className="creator-settings-actions">
            <Link href={"/" + (ar ? "en" : "ar")}>
              {ar ? "تغيير اللغة" : "Switch language"}
            </Link>
          </div>
        </div>

        <div className="creator-settings-section">
          <h2>{ar ? "الخصوصية" : "Privacy"}</h2>
          <p className="creator-muted">
            {ar
              ? "الوصائل إلى المشاركات، حالة الاكتشاف، وإدارة العلاقات."
              : "Sharing settings, discoverability status, and relationship management."}
          </p>
          <Link href={"/" + locale + "/profile"}>
            {ar ? "إدارة الخصوصية" : "Manage privacy"} ↗
          </Link>
        </div>

        <div className="creator-settings-section">
          <h2>{ar ? "المجتمعات والانضمام" : "Communities & Membership"}</h2>
          <p className="creator-muted">
            {ar
              ? "إدارة الانضمام إلى المجتمعات وإعدادات المشاركة."
              : "Manage community memberships and sharing settings."}
          </p>
          <Link href={"/" + locale + "/communities"}>
            {ar ? "إدارة المجتمعات" : "Manage communities"} ↗
          </Link>
        </div>
      </section>

      <footer className="rv-home-footer">
        <a className="rv-brand rv-footer-brand" href={"/" + locale}>
          RAVINE<small>THE PATH TO LIGHT</small>
        </a>
        <span>{ar ? "الكرامة · الإبداع · المعرفة · التقارب الإنساني" : "Dignity · Creativity · Knowledge · Human connection"}</span>
        <span>© RAVINE</span>
      </footer>
    </main>
  );
}