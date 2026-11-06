import { notFound } from "next/navigation";
import DiscoverExplorer from "./explorer";

export default async function DiscoverPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const category = Array.isArray(query.category) ? query.category[0] : query.category;
  return <DiscoverExplorer locale={locale} initialCategory={category ?? "all"} />;
}
