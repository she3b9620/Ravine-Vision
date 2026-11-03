import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function CreatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="CREATOR SPACE" title={locale === "ar" ? "مساحتك المهنية تبدأ من هنا." : "Your professional space starts here."} description={locale === "ar" ? "مساحة منفصلة لإدارة الهويات الإبداعية والأعمال والمشروعات والفريق والجمهور. الوصول والصلاحيات سيُبنيان على قواعد خادمية واضحة." : "A distinct workspace for creative identities, works, projects, teams, and audiences. Access and permissions will be built on explicit server-side rules."} />;
}
