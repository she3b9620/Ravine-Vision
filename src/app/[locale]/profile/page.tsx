import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="PERSONAL UNIVERSE" title={locale === "ar" ? "مساحتك الشخصية." : "Your personal universe."} description={locale === "ar" ? "ملفك واهتماماتك وعلاقاتك ومجموعاتك، مع تحكم واضح فيما تشاركه ومع من." : "Your profile, interests, relationships, and collections—with clear control over what you share and with whom."} />;
}
