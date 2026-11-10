"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ReactionKind = "appreciate" | "thoughtful" | "inspiring";

const ALLOWED_REACTIONS: ReactionKind[] = ["appreciate", "thoughtful", "inspiring"];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function toggleWorkReaction(
  workId: string,
  reaction: ReactionKind,
  locale: string
) {
  if (!ALLOWED_REACTIONS.includes(reaction)) {
    throw new Error("Invalid reaction kind");
  }

  const safeLocale = locale === "en" ? "en" : "ar";
  if (!uuidPattern.test(workId)) redirect(`/${safeLocale}/works`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${safeLocale}/login`);
  }

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from("work_reactions")
    .select("reaction")
    .eq("work_id", workId)
    .eq("account_id", user.id)
    .maybeSingle();

  let error = null;
  if (existing) {
    if (existing.reaction === reaction) {
      // Toggle off
      const result = await supabase
        .from("work_reactions")
        .delete()
        .eq("work_id", workId)
        .eq("account_id", user.id);
      error = result.error;
    } else {
      // Update to new reaction
      const result = await supabase
        .from("work_reactions")
        .update({ reaction })
        .eq("work_id", workId)
        .eq("account_id", user.id);
      error = result.error;
    }
  } else {
    // Insert new reaction
    const result = await supabase.from("work_reactions").insert({
      work_id: workId,
      account_id: user.id,
      reaction,
    });
    error = result.error;
  }

  if (error) redirect(`/${safeLocale}/works/${workId}?error=reaction`);

  revalidatePath(`/${safeLocale}/works/${workId}`);
}

export async function submitWorkComment(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const workId = String(formData.get("work_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!workId || body.length < 1 || body.length > 5000) {
    redirect(`/${locale}/works/${workId}?error=comment_length`);
  }

  if (!uuidPattern.test(workId)) {
    redirect(`/${locale}/works`);
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
