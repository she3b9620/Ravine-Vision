import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function CommunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="COMMUNITIES" title={locale === "ar" ? "مساحات للحوار والانتماء." : "Spaces for dialogue and belonging."} description={locale === "ar" ? "مجتمعات حول الاهتمامات والأعمال والمبدعين، مع مستويات خصوصية وإدارة واضحة تُصمم لاحقًا." : "Communities around interests, works, and creators, with clear privacy and governance models to be designed."} />;
}
