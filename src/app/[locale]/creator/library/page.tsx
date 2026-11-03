import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function CreatorLibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="WORK LIBRARY" title={locale === "ar" ? "كل أعمالك في مكان واحد." : "All your work in one place."} description={locale === "ar" ? "مكتبة لإدارة المسودات والأعمال المنشورة والنسخ والحقوق والبيانات الوصفية." : "A library for drafts, published works, versions, rights declarations, and metadata."} />;
}
