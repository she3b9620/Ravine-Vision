import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function CreatorCommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="CREATOR COMMUNITY" title={locale === "ar" ? "مجتمع حول العمل وصاحبه." : "A community around the work and its creator."} description={locale === "ar" ? "إدارة المجتمع والأعضاء والإرشادات ومستويات الخصوصية والإشراف." : "Manage the community, members, guidelines, privacy levels, and moderation."} />;
}
