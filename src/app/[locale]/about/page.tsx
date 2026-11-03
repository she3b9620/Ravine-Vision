import { notFound } from "next/navigation";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  return (
    <main className="simple-page" dir={ar ? "rtl" : "ltr"}>
      <a className="back-link" href={`/${locale}`}>{ar ? "← الرئيسية" : "← Home"}</a>
      <p className="eyebrow">RAVINE / THE VISION</p>
      <h1>{ar ? "الإبداع طريق إلى الفهم والتقارب." : "Creativity is a path to understanding and connection."}</h1>
      <p>{ar ? "رَافِين مشروع إنساني عالمي، بجذور فلسطينية وعربية وإسلامية، يفتح المجال للسينما والفنون والعلوم والفلسفة والأدب والمعرفة والتجارب الإنسانية." : "RAVINE is a global human project with Palestinian, Arab, and Islamic roots, making room for cinema, arts, science, philosophy, literature, knowledge, and lived experience."}</p>
      <p>{ar ? "لا ندّعي امتلاك الحقيقة، ولا نساوي بين الانتشار والقيمة. نريد مساحة تحترم الإنسان والعمل وسياقه وحقوق صاحبه." : "We do not claim ownership of truth, and we do not confuse reach with value. We aim for a space that respects people, their work, its context, and its creator's rights."}</p>
    </main>
  );
}
