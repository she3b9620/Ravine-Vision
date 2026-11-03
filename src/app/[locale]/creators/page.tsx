import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function CreatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="CREATORS" title={locale === "ar" ? "وراء كل عمل إنسان." : "There is a person behind every work."} description={locale === "ar" ? "اكتشف المبدعين وهوياتهم ومساراتهم وسياقات أعمالهم، دون اختزالهم في أرقام المتابعة." : "Discover creators, their identities, journeys, and the context of their work—without reducing people to follower counts."} />;
}
