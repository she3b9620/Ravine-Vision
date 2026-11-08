import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/session";
import { registerMediaIntent, detachWorkMediaAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; workId: string }>;
  searchParams: Promise<{ registered?: string; detached?: string; error?: string }>;
};

type AttachedMedia = {
  role: string;
  sort_order: number;
  asset_id: string;
  media_assets: {
    id: string;
    asset_kind: string;
    mime_type: string | null;
    byte_size: number | null;
    state: string;
    created_at: string;
  } | null;
};

export default async function WorkMediaPage({ params, searchParams }: Props) {
  const { locale, workId } = await params;
  const query = await searchParams;
  if (locale !== "ar" && locale !== "en") notFound();
  const ar = locale === "ar";
  const { supabase, user } = await requireUser(locale);

  const { data: work } = await supabase
    .from("works")
    .select("id,title")
    .eq("id", workId)
    .eq("created_by", user.id)
    .eq("status", "draft")
    .maybeSingle();

  if (!work) notFound();

  // Query media attached to this specific work
  const { data: rawAttached } = await supabase
    .from("work_media")
    .select("role, sort_order, asset_id, media_assets(id, asset_kind, mime_type, byte_size, state, created_at)")
    .eq("work_id", workId)
    .order("sort_order", { ascending: true });

  const attachedMedia = (rawAttached ?? []) as unknown as AttachedMedia[];

  // Query general media assets owned by user
  const { data: assets } = await supabase
    .from("media_assets")
    .select("id,asset_kind,mime_type,byte_size,state,created_at")
    .eq("owner_account_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const roleLabels: Record<string, string> = ar
    ? {
        primary: "الملف الأساسي للعمل",
        trailer: "إعلان ترويجي (Trailer)",
        teaser: "تشويقة (Teaser)",
        poster: "ملصق فني (Poster)",
        subtitle: "ملف ترجمة (Subtitle)",
        supplementary: "ملحق إضافي",
      }
    : {
        primary: "Primary Work File",
        trailer: "Trailer",
        teaser: "Teaser",
        poster: "Poster",
        subtitle: "Subtitle",
        supplementary: "Supplementary",
      };

  const stateLabels: Record<string, string> = ar
    ? {
        initiated: "بانتظار الرفع والتجهيز",
        uploading: "جارٍ الرفع",
        uploaded: "تم الرفع بنجاح",
        processing: "قيد المعالجة الفنية",
        ready: "جاهز للعرض",
        failed: "تعذر التجهيز",
        quarantined: "موقوف للمراجعة",
        deleted: "محذوف",
      }
    : {
        initiated: "Awaiting upload & processing",
        uploading: "Uploading",
        uploaded: "Uploaded",
        processing: "Processing",
        ready: "Ready for playback",
        failed: "Processing failed",
        quarantined: "Quarantined",
        deleted: "Deleted",
      };

  return (
    <main className="creator-screen" dir={ar ? "rtl" : "ltr"}>
      <header className="creator-header">
        <Link className="rv-logo" href={"/" + locale}>
          <i className="rv-logo-wordmark" role="img" aria-label="RAVINE" />
        </Link>
        <nav>
          <Link href={"/" + locale + "/creator/library"}>
            {ar ? "مكتبة الأعمال" : "Work library"}
          </Link>
          <Link href={"/" + locale + "/creator/library/" + workId + "/rights"}>
            {ar ? "الحقوق" : "Rights"}
          </Link>
        </nav>
      </header>

      <section className="creator-intro">
        <p className="rv-eyebrow">
          <i />MEDIA INTAKE & ATTACHMENT
        </p>
        <h1>{ar ? "وسائط العمل وملفاته." : "Work media & assets."}</h1>
        <p>
          {ar
            ? "سجّل بيانات ملفات العمل واربطها بأدوار العرض (الملف الأساسي، الملصق، الإعلان الترويجي). تبقى الملفات في حالة «بانتظار الرفع» حتى اكتمال التخزين السحابي الآمن."
            : "Register work files and attach them to display roles (primary file, poster, trailer). Assets remain initiated until secure cloud storage is finalized."}
        </p>
      </section>

      {/* Currently attached media for this work */}
      <section className="creator-panel">
        <h2>{ar ? `الوسائط المرتبطة بعمل: ${work.title}` : `Attached media for: ${work.title}`} ({attachedMedia.length})</h2>
        {query.registered && (
          <p className="creator-alert success" role="status">
            {ar
              ? "تم تسجيل الوسيط وربطه بالعمل بنجاح."
              : "Media metadata registered and attached to work."}
          </p>
        )}
        {query.detached && (
          <p className="creator-alert success" role="status">
            {ar ? "تم فك ارتباط الوسيط بالعمل." : "Media detached from work."}
          </p>
        )}
        {query.error && (
          <p className="creator-alert" role="alert">
            {ar
              ? "تعذر إتمام العملية. راجع صحة البيانات."
              : "Could not complete the operation. Check input details."}
          </p>
        )}

        {attachedMedia.length > 0 ? (
          <div className="creator-work-list">
            {attachedMedia.map((item) => {
              const asset = item.media_assets;
              return (
                <article className="creator-identity" key={`${item.asset_id}-${item.role}`}>
                  <div className="creator-library-heading">
                    <h3>{roleLabels[item.role] ?? item.role}</h3>
                    <strong>{asset?.asset_kind.toUpperCase() ?? "FILE"}</strong>
                  </div>
                  <p>
                    {asset?.mime_type ?? "unknown mime"} ·{" "}
                    {asset?.byte_size
                      ? `${(Number(asset.byte_size) / (1024 * 1024)).toFixed(2)} MB`
                      : "0 MB"}
                  </p>
                  <small>
                    {ar ? "الحالة: " : "State: "}
                    {stateLabels[asset?.state ?? "initiated"] ?? asset?.state}
                  </small>
                  <form action={detachWorkMediaAction} className="creator-team-actions" style={{ marginTop: "12px" }}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="work_id" value={workId} />
                    <input type="hidden" name="asset_id" value={item.asset_id} />
                    <input type="hidden" name="role" value={item.role} />
                    <button type="submit" className="creator-review-reject">
                      {ar ? "فك الارتباط عن العمل" : "Detach from work"}
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="creator-muted">
            {ar
              ? "لم يتم ربط أي وسائط بهذا العمل بعد. استخدم النموذج أدناه لتسجيل الملف الأساسي أو الملصق."
              : "No media attached to this work yet. Use the form below to register the primary file or poster."}
          </p>
        )}
      </section>

      {/* Register new media and attach to this work */}
      <section className="creator-panel">
        <h2>{ar ? "تسجيل وسيط جديد وربطه بالعمل" : "Register and attach new media"}</h2>
        <form action={registerMediaIntent} className="creator-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="work_id" value={workId} />

          <label>
            {ar ? "دور الوسيط في العمل" : "Media role"}
            <select name="role" defaultValue="primary">
              <option value="primary">{roleLabels.primary}</option>
              <option value="poster">{roleLabels.poster}</option>
              <option value="trailer">{roleLabels.trailer}</option>
              <option value="teaser">{roleLabels.teaser}</option>
              <option value="subtitle">{roleLabels.subtitle}</option>
              <option value="supplementary">{roleLabels.supplementary}</option>
            </select>
          </label>

          <label>
            {ar ? "نوع الملف" : "Asset type"}
            <select name="asset_kind" defaultValue="video">
              <option value="video">{ar ? "فيديو" : "Video"}</option>
              <option value="audio">{ar ? "صوت" : "Audio"}</option>
              <option value="image">{ar ? "صورة" : "Image"}</option>
              <option value="document">{ar ? "مستند" : "Document"}</option>
            </select>
          </label>

          <label>
            {ar ? "صيغة MIME" : "MIME type"}
            <select name="mime_type" defaultValue="video/mp4">
              <optgroup label="Video">
                <option value="video/mp4">video/mp4</option>
                <option value="video/webm">video/webm</option>
                <option value="video/quicktime">video/quicktime</option>
              </optgroup>
              <optgroup label="Audio">
                <option value="audio/mpeg">audio/mpeg</option>
                <option value="audio/mp4">audio/mp4</option>
                <option value="audio/wav">audio/wav</option>
                <option value="audio/ogg">audio/ogg</option>
                <option value="audio/webm">audio/webm</option>
              </optgroup>
              <optgroup label="Image">
                <option value="image/jpeg">image/jpeg</option>
                <option value="image/png">image/png</option>
                <option value="image/webp">image/webp</option>
                <option value="image/avif">image/avif</option>
              </optgroup>
              <optgroup label="Document">
                <option value="application/pdf">application/pdf</option>
              </optgroup>
            </select>
          </label>

          <label>
            {ar ? "الحجم المتوقع بالبايت" : "Expected size in bytes"}
            <input
              name="byte_size"
              type="number"
              min="1"
              max="5368709120"
              required
              placeholder="10485760 (10 MB)"
            />
          </label>

          <button className="creator-submit" type="submit">
            {ar ? "تسجيل بيانات الملف وربطه ↗" : "Register and attach file ↗"}
          </button>
        </form>
        <p className="creator-muted">
          {ar
            ? "الحد الأقصى الحالي لتسجيل البيانات هو 5 جيجابايت. التخزين الفعلي سيُتاح فور اكتمال تكامل خادم التخزين."
            : "Current intake ceiling is 5 GB. Physical uploads will activate once storage integration is complete."}
        </p>
      </section>

      {/* Account general assets overview */}
      <section className="creator-panel">
        <h2>{ar ? "سائر الوسائط المسجلة على حسابك" : "Other media registered to your account"}</h2>
        {assets?.length ? (
          <div className="creator-work-list">
            {assets.map((a) => (
              <article className="creator-identity" key={a.id}>
                <strong>
                  {a.asset_kind.toUpperCase()} · {a.mime_type ?? "—"}
                </strong>
                <small>
                  {ar ? "الحالة: " : "State: "}
                  {stateLabels[a.state] ?? a.state} ·{" "}
                  {a.byte_size
                    ? `${(Number(a.byte_size) / (1024 * 1024)).toFixed(2)} MB`
                    : "0 MB"}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <p className="creator-muted">
            {ar ? "لا توجد وسائط أخرى مسجلة." : "No other media registered."}
          </p>
        )}
      </section>
    </main>
  );
}
