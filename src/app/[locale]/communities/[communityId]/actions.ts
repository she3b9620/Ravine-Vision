"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function joinCommunityAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  if (!uuidPattern.test(communityId)) return;
  const route = `/${locale}/communities/${communityId}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Membership is request-only. The account never grants itself active status;
  // owner approval remains an OPEN workflow decision.
  const { data: existing } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("account_id", user.id)
    .maybeSingle();

  let error = null;
  if (existing) {
    if (existing.status === "left") {
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
}

export async function leaveCommunityAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  if (!uuidPattern.test(communityId)) return;
  const route = `/${locale}/communities/${communityId}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { error } = await supabase
    .from("community_memberships")
    .update({ status: "left" })
    .eq("community_id", communityId)
    .eq("account_id", user.id);

  if (error) redirect(route + "?error=membership");
  revalidatePath(route);
}
