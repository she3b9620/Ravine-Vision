"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const allowedMimes: Record<string, string[]> = {
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm"],
  image: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  document: ["application/pdf"],
};

const allowedRoles = ["primary", "trailer", "teaser", "poster", "subtitle", "supplementary"] as const;

export async function registerMediaIntent(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const workId = String(formData.get("work_id") ?? "");
  const kind = String(formData.get("asset_kind") ?? "");
  const mime = String(formData.get("mime_type") ?? "").toLowerCase();
  const role = String(formData.get("role") ?? "primary");
  const bytes = Number(formData.get("byte_size") ?? 0);
  const base = "/" + locale + "/creator/library/" + encodeURIComponent(workId) + "/media";

  if (
    !workId ||
    !Object.hasOwn(allowedMimes, kind) ||
    !allowedMimes[kind].includes(mime) ||
    !allowedRoles.includes(role as (typeof allowedRoles)[number]) ||
    !Number.isSafeInteger(bytes) ||
    bytes < 1 ||
    bytes > 5 * 1024 * 1024 * 1024
  ) {
    redirect(base + "?error=validation");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/" + locale + "/login");

  const { data: work } = await supabase
    .from("works")
    .select("id")
    .eq("id", workId)
    .eq("created_by", user.id)
    .eq("status", "draft")
    .maybeSingle();

  if (!work) redirect("/" + locale + "/creator/library?error=unavailable");

  // Insert media asset metadata
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      owner_account_id: user.id,
      asset_kind: kind,
      mime_type: mime,
      byte_size: bytes,
    })
    .select("id")
    .single();

  if (assetError || !asset) redirect(base + "?error=save");

  // Link asset to work
  const { error: linkError } = await supabase.from("work_media").insert({
    work_id: work.id,
    asset_id: asset.id,
    role,
    sort_order: 0,
  });

  if (linkError) redirect(base + "?error=link");

  revalidatePath(base);
  redirect(base + "?registered=1");
}

export async function detachWorkMediaAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const workId = String(formData.get("work_id") ?? "");
  const assetId = String(formData.get("asset_id") ?? "");
  const role = String(formData.get("role") ?? "");
  const base = "/" + locale + "/creator/library/" + encodeURIComponent(workId) + "/media";

  if (!workId || !assetId || !role) redirect(base + "?error=validation");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/" + locale + "/login");

  // Verify ownership of the work
  const { data: work } = await supabase
    .from("works")
    .select("id")
    .eq("id", workId)
    .eq("created_by", user.id)
    .eq("status", "draft")
    .maybeSingle();

  if (!work) redirect(base + "?error=unavailable");

  await supabase
    .from("work_media")
    .delete()
    .eq("work_id", workId)
    .eq("asset_id", assetId)
    .eq("role", role);

  revalidatePath(base);
  redirect(base + "?detached=1");
}
