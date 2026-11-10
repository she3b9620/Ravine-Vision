"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/session";
import { parseEntryQuestions } from "@/lib/entry-quiz";

const route = (locale: string) => "/" + locale + "/creator/community";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VISIBILITIES = new Set(["public", "discoverable_private", "invite_only"]);

export async function createCommunity(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const identityId = String(formData.get("creator_identity_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const guidelines = String(formData.get("guidelines") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "public");

  if (!VISIBILITIES.has(visibility)) {
    redirect(route(locale) + "?error=validation");
  }

  if (
    !uuidPattern.test(identityId) ||
    name.length < 3 ||
    name.length > 80 ||
    description.length > 600 ||
    guidelines.length > 2000
  ) {
    redirect(route(locale) + "?error=validation");
  }

  const parsedQuestions = parseEntryQuestions(formData.get("entry_questions") ?? "");
  if (!parsedQuestions.ok) {
    redirect(route(locale) + "?error=validation");
  }

  const { supabase, user } = await requireUser(locale);
  const { data: identity } = await supabase
    .from("creator_identities")
    .select("id,status")
    .eq("id", identityId)
    .eq("owner_account_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!identity) redirect(route(locale) + "?error=identity");

  const { data: created, error } = await supabase
    .from("communities")
    .insert({
      owner_creator_identity_id: identity.id,
      name,
      description: description || null,
      guidelines: guidelines || null,
      visibility,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !created) redirect(route(locale) + "?error=save");

  if (parsedQuestions.questions.length > 0) {
    const { error: quizError } = await supabase.rpc("save_community_entry_quiz", {
      p_community_id: created.id,
      p_questions: parsedQuestions.questions,
    });
    if (quizError) redirect(route(locale) + "?error=quiz");
  }

  redirect(route(locale) + "?created=1");
}
