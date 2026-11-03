import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="WORKS" title={locale === "ar" ? "الأعمال تتجاوز التصنيفات." : "Works beyond categories."} description={locale === "ar" ? "مساحة للأفلام والفيديو والصوت والكتابة والفنون والأبحاث والأرشيف وسائر أشكال التعبير." : "A home for film, video, audio, writing, arts, research, archives, and many other forms of expression."} />;
}
