"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function submitEntryQuizAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  const route = `/${locale}/communities/${communityId}`;

  if (!uuidPattern.test(communityId)) {
    redirect(route + "?error=membership");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Only the public question shape is read here; answer keys stay private.
  const { data: community } = await supabase
    .from("communities")
    .select("entry_questions")
    .eq("id", communityId)
    .maybeSingle();

  const questions = (community?.entry_questions ?? []) as { id: string }[];

  if (!Array.isArray(questions) || questions.length === 0) {
    redirect(route);
  }

  const { data: existing } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("account_id", user.id)
    .maybeSingle();

  if (existing && existing.status === "active") {
    redirect(route);
  }

  const answers: Record<string, string> = {};
  for (const question of questions) {
    const value = formData.get(`question_${question.id}`);
    if (value !== null) answers[question.id] = String(value);
  }

  // The database compares answers against the private key table and returns a
  // boolean. The key never reaches the browser.
  const { data: correct, error: quizError } = await supabase.rpc(
    "validate_community_entry_quiz",
    { p_community_id: communityId, p_answers: answers },
  );

  if (quizError) {
    redirect(route + "?error=membership");
  }
  if (!correct) {
    redirect(`${route}/entry-quiz?error=incorrect`);
  }

  // Create the membership request; owner approval is still required.
  const { data: already } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("account_id", user.id)
    .maybeSingle();

  let error = null;
  if (already) {
    if (already.status === "left" || already.status === "requested") {
      const result = await supabase
        .from("community_memberships")
        .update({ status: "requested" })
        .eq("community_id", communityId)
        .eq("account_id", user.id);
      error = result.error;
    }
  } else {
    const result = await supabase.from("community_memberships").insert({
      community_id: communityId,
      account_id: user.id,
      role: "member",
      status: "requested",
    });
    error = result.error;
  }

  if (error) redirect(route + "?error=membership");
  revalidatePath(route);
  redirect(route + "?joined=1");
}
