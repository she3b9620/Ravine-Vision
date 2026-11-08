import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";

  const principles = ar
    ? [
        { num: "٠١", title: "كرامة الإنسان قبل الربح", desc: "الإنسان ليس سلعة، وتجربته وكرامته مقدمة على تعظيم عوائد الاستهلاك الرقمي." },
        { num: "٠٢", title: "حرية التعبير المسؤولة", desc: "فضاء مفتوح للتعبير محمي من الإساءة والضرر والتحرش والاحتيال والتلاعب المنظم." },
        { num: "٠٣", title: "عدم الإقصاء الفكري أو الثقافي", desc: "أصالة ذات جذور فلسطينية وعربية وإسلامية تلتقي مع الإنسانية كلها دون انغلاق أو استعلاء." },
        { num: "٠٤", title: "البحث عن الحقيقة بلا ادعاء مطلق", desc: "تشجيع التفكير والبرهان والبحث المشترك، دون احتكار للحقيقة أو فرض للوصاية." },
        { num: "٠٥", title: "حفظ الإبداع والمعرفة والتجارب", desc: "أرشفة وتوثيق الأعمال الجادة وصونها من التلاشي في خوارزميات الاستهلاك السريع." },
        { num: "٠٦", title: "التفاعل لا يساوي القيمة", desc: "عمق العمل وأثره الإنساني لا يقاسان بكثافة الضجيج الرقمي أو سرعة التداول." },
        { num: "٠٧", title: "الانتشار لا يساوي الاستحقاق", desc: "إتاحة الفضاء للأعمال المتقنة والناشئة، بدلًا من حصر الظهور لمن يمتلك جمهورًا كبيرًا بالفعل." },
        { num: "٠٨", title: "الأرقام ليست شهادة جودة", desc: "المشاهدات والإعجابات والمتابعات مؤشرات كمية قابلة للتضليل ولا تعبر بالضرورة عن الجدارة." },
        { num: "٠٩", title: "المال وسيلة للتمكين لا غاية حاكمة", desc: "تمكين المبدعين من عوائد عادلة ومستدامة، دون تحويل المنصة إلى سوق استهلاكي بحت." },
        { num: "١٠", title: "التقنية في خدمة الإنسان", desc: "الأدوات الرقمية وسائط لتوسيع مدارك البشر ومد جسور التفاهم، وليست غايات قائمة بذاتها." },
        { num: "١١", title: "السلطة خاضعة للمساءلة والتدقيق", desc: "قرارات الإشراف والمراجعة والتحكيم موثقة وخاضعة لسجلات تدقيق ومعايير واضحة." },
        { num: "١٢", title: "حماية الحقوق وسيادة المبدع", desc: "الملكية الفكرية والحق الأدبي لصانع العمل مصونان، والنشر لا يعني مصادرة رافين للملكية." },
        { num: "١٣", title: "رفض التصميم الإدماني واستنزاف الانتباه", desc: "واجهات هادئة ورصينة تتيح التأمل، وترفض أساليب التلاعب العصبي وسرقة الوقت." },
        { num: "١٤", title: "الشفافية في التقييم والترشيح", desc: "وضوح المعايير الخوارزمية والإشرافية، وإتاحة معرفة دواعي ظهور الأعمال والتوصيات." },
        { num: "١٥", title: "حق الأعمال الناشئة في الوصول", desc: "كسر احتكار الأسماء الكبرى، ومنح المبدعين الجدد والجادين فضاءً حقيقيًا للاكتشاف والنمو." },
      ]
    : [
        { num: "01", title: "Human Dignity Over Profit", desc: "Human beings are not commodities; their dignity and growth precede algorithmic monetization." },
        { num: "02", title: "Responsible Freedom of Expression", desc: "An open creative realm safeguarded against abuse, harassment, fraud, and organized manipulation." },
        { num: "03", title: "Cultural Inclusion & Authentic Roots", desc: "Palestinian, Arab, and Islamic roots meeting global humanity in an open, respectful dialogue." },
        { num: "04", title: "Seeking Truth Without Monopolizing It", desc: "Encouraging rigorous inquiry, reason, and reflection without claiming absolute ownership of truth." },
        { num: "05", title: "Preserving Creativity & Human Experience", desc: "Archiving serious thought and artistic craft from vanishing inside fleeting consumption cycles." },
        { num: "06", title: "Engagement Does Not Equal Value", desc: "Artistic depth and human impact are not measured by digital noise or virality." },
        { num: "07", title: "Reach Does Not Equal Merit", desc: "Space for emerging and thoughtful works, rather than reserving visibility only for established followings." },
        { num: "08", title: "Numbers Are Not Proof of Quality", desc: "Views, likes, and follower tallies are easily manipulated vanity metrics, not certificates of excellence." },
        { num: "09", title: "Money as a Means for Sustainable Dignity", desc: "Fair compensation to empower creators sustainably, without subordinating the user experience to ads." },
        { num: "10", title: "Technology Serving Humanity", desc: "Digital systems designed to broaden human understanding and build genuine connection, not vice versa." },
        { num: "11", title: "Accountable Platform Authority", desc: "Moderation and editorial decisions backed by immutable audit records, with transparent appeal mechanisms." },
        { num: "12", title: "Creator Sovereignty & Rights", desc: "Intellectual property remains with its creative identity; publishing does not forfeit rights to RAVINE." },
        { num: "13", title: "No Addictive Attention Exploitation", desc: "A deliberate, tranquil interface respecting user attention and rejecting manipulative hooks." },
        { num: "14", title: "Algorithmic & Evaluation Transparency", desc: "Clear criteria behind recommendations, curation, and payouts without opaque shadow policies." },
        { num: "15", title: "Fair Discovery for Emerging Voices", desc: "Breaking monolithic popularity loops so new, serious creations receive genuine space to be discovered." },
      ];

  const epistemics = ar
    ? [
        { label: "الحقيقة المثبتة", desc: "المعرفة المؤكدة بالبرهان الحاسم والتجربة القاطعة." },
        { label: "الدليل", desc: "البيان أو القرينة التي تؤيد افتراضًا أو ترجحه." },
        { label: "الاعتقاد", desc: "اليقين الإيماني أو الفلسفي الداخلي للإنسان." },
        { label: "الرأي", desc: "وجهة النظر القابلة للاختلاف والنقاش." },
        { label: "الفرضية", desc: "طرح علمي أو تفسيري قيد الاختبار والتحقق." },
        { label: "التفسير", desc: "قراءة تحليلية لفعل أو نص أو ظاهرة تاريخية أو فنية." },
        { label: "التجربة الشخصية", desc: "شهادة ذاتية تروي معايشة واقعية دون تعميم قسري." },
        { label: "الادعاء", desc: "قول معروض للتحقق يتطلب التوثيق والمصدر قبل اعتماده." },
      ]
    : [
        { label: "Established Fact", desc: "Knowledge confirmed through conclusive evidence and rigorous demonstration." },
        { label: "Evidence", desc: "Proof or data substantiating or supporting a reasoned claim." },
        { label: "Belief", desc: "Inward spiritual, philosophical, or existential conviction." },
        { label: "Opinion", desc: "A subjective viewpoint open to healthy divergence and dialogue." },
        { label: "Hypothesis", desc: "A reasoned proposition undergoing testing and investigation." },
        { label: "Interpretation", desc: "An analytical reading of a text, event, or artistic work." },
        { label: "Personal Experience", desc: "A firsthand subjective lived narrative without ungrounded generalization." },
        { label: "Unverified Claim", desc: "An assertion awaiting evidence and rigorous verification before acceptance." },
      ];

  return (
    <main className="simple-page about-manifesto-page" dir={ar ? "rtl" : "ltr"}>
      <Link className="back-link" href={`/${locale}`}>
        {ar ? "← الرئيسية" : "← Home"}
      </Link>

      {/* Header section */}
      <section className="manifesto-header">
        <p className="eyebrow">
          <span></span>
          RAVINE / THE CHARTER
        </p>
        <h1>{ar ? "الشِّعب، الطريق إلى النور." : "The Path to Light."}</h1>
        <p className="manifesto-lead">
          {ar
            ? "رَافِين منظومة إنسانية عالمية للإبداع والثقافة والمعرفة والتعبير، تجمع بين الجذور الفلسطينية والعربية والإسلامية الأصيلة، وبين الانفتاح الصادق على كل ما أبدعه الإنسان في هذا العالم."
            : "RAVINE is a global human space for creativity, culture, and thoughtful expression—grounded in Palestinian, Arab, and Islamic roots while opening its doors to all of humanity's creations and lived experiences."}
        </p>
      </section>

      {/* Epistemic clarity section */}
      <section className="manifesto-section">
        <p className="rv-eyebrow">
          <i />EPISTEMIC INTEGRITY
        </p>
        <h2>{ar ? "الوعي الفكري والتمييز المعرفي" : "Epistemic Clarity & Truth"}</h2>
        <p className="manifesto-section-desc">
          {ar
            ? "لا تدّعي رافين امتلاك الحقيقة المطلقة، بل توفر فضاءً جادًا لفهمها والبحث عنها. لذلك تميز المنصة بين أصناف المعرفة ولا تخلط بينها:"
            : "RAVINE does not claim a monopoly on truth, but offers a serious space to seek and understand it. Our systems distinguish sharply between different categories of knowledge:"}
        </p>

        <div className="epistemics-grid">
          {epistemics.map((item) => (
            <article key={item.label} className="epistemic-card">
              <h3>{item.label}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* The 15 Principles */}
      <section className="manifesto-section">
        <p className="rv-eyebrow">
          <i />FOUNDATIONAL CHARTER
        </p>
        <h2>{ar ? "المبادئ الخمسة عشر المؤسسة" : "The 15 Foundational Principles"}</h2>
        <p className="manifesto-section-desc">
          {ar
            ? "تُعامل هذه المبادئ كأساس فلسفي وأخلاقي صارم يحكم كل قرار منتج أو تقني أو مجتمعي داخل رافين:"
            : "These principles serve as the ethical and philosophical foundation for every engineering, product, and community decision inside RAVINE:"}
        </p>

        <div className="principles-grid">
          {principles.map((item) => (
            <article key={item.num} className="principle-card">
              <span className="principle-number">{item.num}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Human Dignity & Rights commitment */}
      <section className="manifesto-commitment">
        <h2>{ar ? "سيادة المبدع وأمان المجتمع" : "Creator Sovereignty & Community Safety"}</h2>
        <p>
          {ar
            ? "كل عمل ينشر على رافين تعود ملكيته وسياقه ومسؤوليته إلى هويته الإبداعية. كما تلتزم رافين بحماية المجتمع من التحريض والإساءة والتلاعب عبر مسارات إشراف قابلة للمساءلة وسجلات تدقيق غير قابلة للتعديل."
            : "Every work published on RAVINE remains the sovereign property and responsibility of its declared creative identity. RAVINE is committed to safeguarding communities through auditable, accountable review and immutable moderation logs."}
        </p>
        <div className="manifesto-cta-row">
          <Link href={`/${locale}/works`} className="action-button-accent">
            {ar ? "استكشف الأعمال المنشورة ↗" : "Explore Published Works ↗"}
          </Link>
          <Link href={`/${locale}/creator`} className="secondary-action-link">
            {ar ? "فضاء المبدع وإدارة الأعمال" : "Creator Space & Studio"}
          </Link>
        </div>
      </section>
    </main>
  );
}
