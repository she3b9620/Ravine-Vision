"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/session";
import { parseEntryQuestions } from "@/lib/entry-quiz";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveQuizAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  const route = `/${locale}/creator/community/${communityId}/quiz`;

  if (!uuidPattern.test(communityId)) {
    redirect(route);
  }

  const { supabase } = await requireUser(locale);

  const parsed = parseEntryQuestions(formData.get("entry_questions") ?? "");
  if (!parsed.ok) {
    redirect(route + "?error=validation");
  }

  // Ownership is enforced again inside the SECURITY DEFINER function.
  const { error } = await supabase.rpc("save_community_entry_quiz", {
    p_community_id: communityId,
    p_questions: parsed.questions,
  });

  if (error) {
    redirect(route + "?error=save");
  }

  revalidatePath(`/${locale}/communities/${communityId}`);
  revalidatePath(route);
  redirect(route + "?saved=1");
}
