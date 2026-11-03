import { notFound } from "next/navigation";
import { SectionPlaceholder } from "@/components/section-placeholder";

export default async function EarningsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <SectionPlaceholder locale={locale} code="CREATOR ECONOMY" title={locale === "ar" ? "اقتصاد إبداعي واضح وعادل." : "A clear and fair creative economy."} description={locale === "ar" ? "ستُبنى هنا لوحة شفافة للأرصدة والاستحقاقات والتوزيعات، بعد اعتماد السياسات ومزودي الخدمات. لا توجد أرباح أو مدفوعات مفعلة الآن." : "A transparent view of balances, entitlements, and distributions will live here after policies and providers are approved. Earnings and payments are not enabled yet."} />;
}
