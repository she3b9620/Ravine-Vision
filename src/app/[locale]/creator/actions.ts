"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const route = (locale: string, suffix = "") => "/" + (locale === "en" ? "en" : "ar") + "/creator" + suffix;

export async function submitCreatorApplication(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const displayName = String(formData.get("display_name") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim().replace(/^@/, "").toLowerCase();
  const biography = String(formData.get("biography") ?? "").trim();
  const disciplines = formData.getAll("discipline").map(String).filter(Boolean);
  const statement = String(formData.get("statement") ?? "").trim();
  if (displayName.length < 2 || displayName.length > 80 || biography.length < 30 || biography.length > 2000 || statement.length < 50 || statement.length > 4000 || !/^[a-z0-9_]{3,30}$/.test(handle) || disciplines.length === 0) redirect(route(locale, "?error=validation"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");
  const { data: identity, error: identityError } = await supabase.from("creator_identities")
    .insert({ owner_account_id: user.id, display_name: displayName, handle, biography, discipline_tags: disciplines })
    .select("id").single();
  if (identityError || !identity) redirect(route(locale, "?error=identity"));
  const { error } = await supabase.from("creator_applications")
    .insert({ creator_identity_id: identity.id, applicant_account_id: user.id, statement });
  if (error) redirect(route(locale, "?error=application"));
  redirect(route(locale, "?submitted=1"));
}
