"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleFollowCreatorAction(creatorId: string, locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Check if following already
  const { data: existing } = await supabase
    .from("follows")
    .select("follower_account_id")
    .eq("follower_account_id", user.id)
    .eq("followed_creator_identity_id", creatorId)
    .maybeSingle();

  if (existing) {
    // Unfollow
    await supabase
      .from("follows")
      .delete()
      .eq("follower_account_id", user.id)
      .eq("followed_creator_identity_id", creatorId);
  } else {
    // Follow
    await supabase.from("follows").insert({
      follower_account_id: user.id,
      followed_creator_identity_id: creatorId,
    });
  }

  revalidatePath(`/${locale}/creators/${creatorId}`);
}
