import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function StudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="CREATOR STUDIO" title={locale === "ar" ? "إدارة العمل الإبداعي." : "Manage the creative work."} description={locale === "ar" ? "ستجمع الاستوديوهات أدوات إدارة الأعمال والمشروعات والتعاون والنشر في مساحة واحدة." : "The studio will bring work, project, collaboration, and publishing management into one workspace."} />;
}
