import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="ACCOUNT SETTINGS" title={locale === "ar" ? "إعداداتك وخصوصيتك." : "Your settings and privacy."} description={locale === "ar" ? "ستضم هذه المساحة اللغة والخصوصية والأمان والجلسات وإدارة البيانات والتفضيلات." : "This space will bring together language, privacy, security, sessions, data controls, and preferences."} />;
}
