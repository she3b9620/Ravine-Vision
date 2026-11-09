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

  // Verify the community has entry questions and the user hasn't already joined.
  const { data: community } = await supabase
    .from("communities")
    .select("entry_questions")
    .eq("id", communityId)
    .maybeSingle();

  const questions = community?.entry_questions as
    | { id: string; question: string; type: string; options?: string[]; correct_answer?: string | string[] }[]
    | undefined;

  if (!Array.isArray(questions) || questions.length === 0) {
    redirect(route);
  }

  // Check if already a member.
  const { data: existing } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("account_id", user.id)
    .maybeSingle();

  if (existing && existing.status === "active") {
    redirect(route);
  }

  // Validate answers: every question must be answered correctly.
  let allCorrect = true;
  for (const q of questions) {
    const userAnswer = formData.get(`question_${q.id}`);
    if (userAnswer === null) {
      allCorrect = false;
      break;
    }
    const answer = String(userAnswer).trim();
    const correct = q.correct_answer;
    if (correct === undefined) {
      allCorrect = false;
      break;
    }
    const correctValues = Array.isArray(correct) ? correct : [correct];
    if (!correctValues.some((c) => String(c).trim().toLowerCase() === answer.toLowerCase())) {
      allCorrect = false;
      break;
    }
  }

  if (!allCorrect) {
    redirect(`${route}/entry-quiz?error=incorrect`);
  }

  // Create the membership request (owner approval still required).
  const { data: already } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("account_id", user.id)
    .maybeSingle();

  let error = null;
  if (already) {
    if (already.status === "left") {
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
