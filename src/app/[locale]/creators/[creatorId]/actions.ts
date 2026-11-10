"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function toggleFollowCreatorAction(creatorId: string, locale: string) {
  const safeLocale = locale === "en" ? "en" : "ar";
  if (!uuidPattern.test(creatorId)) redirect(`/${safeLocale}/creators`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${safeLocale}/login`);
  }

  // Check if following already
  const { data: existing } = await supabase
    .from("follows")
    .select("follower_account_id")
    .eq("follower_account_id", user.id)
    .eq("followed_creator_identity_id", creatorId)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("follows")
        .delete()
        .eq("follower_account_id", user.id)
        .eq("followed_creator_identity_id", creatorId)
    : await supabase.from("follows").insert({
        follower_account_id: user.id,
        followed_creator_identity_id: creatorId,
      });

  if (error) redirect(`/${safeLocale}/creators/${creatorId}?error=follow`);

  revalidatePath(`/${safeLocale}/creators/${creatorId}`);
}
