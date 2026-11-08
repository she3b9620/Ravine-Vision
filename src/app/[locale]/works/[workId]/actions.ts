"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ReactionKind = "appreciate" | "thoughtful" | "inspiring";

const ALLOWED_REACTIONS: ReactionKind[] = ["appreciate", "thoughtful", "inspiring"];

export async function toggleWorkReaction(
  workId: string,
  reaction: ReactionKind,
  locale: string
) {
  if (!ALLOWED_REACTIONS.includes(reaction)) {
    throw new Error("Invalid reaction kind");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from("work_reactions")
    .select("reaction")
    .eq("work_id", workId)
    .eq("account_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.reaction === reaction) {
      // Toggle off
      await supabase
        .from("work_reactions")
        .delete()
        .eq("work_id", workId)
        .eq("account_id", user.id);
    } else {
      // Update to new reaction
      await supabase
        .from("work_reactions")
        .update({ reaction })
        .eq("work_id", workId)
        .eq("account_id", user.id);
    }
  } else {
    // Insert new reaction
    await supabase.from("work_reactions").insert({
      work_id: workId,
      account_id: user.id,
      reaction,
    });
  }

  revalidatePath(`/${locale}/works/${workId}`);
}

export async function submitWorkComment(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const workId = String(formData.get("work_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!workId || body.length < 1 || body.length > 5000) {
    redirect(`/${locale}/works/${workId}?error=comment_length`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { error } = await supabase.from("work_comments").insert({
    work_id: workId,
    account_id: user.id,
    body,
  });

  if (error) {
    redirect(`/${locale}/works/${workId}?error=comment_failed`);
  }

  revalidatePath(`/${locale}/works/${workId}`);
}
