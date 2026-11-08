"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinCommunityAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  if (!communityId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Check if membership row already exists
  const { data: existing } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("account_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status !== "active") {
      await supabase
        .from("community_memberships")
        .update({ status: "active" })
        .eq("community_id", communityId)
        .eq("account_id", user.id);
    }
  } else {
    await supabase.from("community_memberships").insert({
      community_id: communityId,
      account_id: user.id,
      role: "member",
      status: "active",
    });
  }

  revalidatePath(`/${locale}/communities/${communityId}`);
}

export async function leaveCommunityAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  if (!communityId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  await supabase
    .from("community_memberships")
    .update({ status: "left" })
    .eq("community_id", communityId)
    .eq("account_id", user.id);

  revalidatePath(`/${locale}/communities/${communityId}`);
}
