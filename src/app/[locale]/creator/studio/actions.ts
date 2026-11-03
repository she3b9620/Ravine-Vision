"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createWorkDraft(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const base = "/" + locale + "/creator";
  const identityId = String(formData.get("creator_identity_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const language = String(formData.get("language_code") ?? "ar");
  if (!identityId || title.length < 2 || title.length > 160 || synopsis.length > 3000 ||
      !["short","video","podcast","documentary","short_film","feature_film","series","photography","visual_art","music","writing","book","research","lecture","conversation","archive","other"].includes(kind) ||
      !["ar","en","und"].includes(language)) {
    redirect(base + "/studio?error=validation");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");
  const { data: identity } = await supabase.from("creator_identities")
    .select("id").eq("id", identityId).eq("owner_account_id", user.id).maybeSingle();
  if (!identity) redirect(base + "/studio?error=identity");
  const { error } = await supabase.from("works").insert({
    creator_identity_id: identity.id,
    created_by: user.id,
    title,
    synopsis: synopsis || null,
    kind,
    status: "draft",
    language_code: language,
    visibility: "private",
  });
  if (error) redirect(base + "/studio?error=save");
  redirect(base + "/library?created=1");
}
