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

  // If the community requires entry questions, route to the entry quiz first.
  const { data: community } = await supabase
    .from("communities")
    .select("entry_questions")
    .eq("id", communityId)
    .maybeSingle();

  const hasEntryQuestions =
    community && Array.isArray(community.entry_questions) && community.entry_questions.length > 0;

  if (hasEntryQuestions) {
    redirect(`${route}/entry-quiz`);
  }

  // Membership is request-only. The account never grants itself active status;
  // owner approval is handled through the owner approval flow.
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

export async function approveMembershipAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  const accountId = String(formData.get("account_id") ?? "").trim();
  const route = `/${locale}/communities/${communityId}`;

  if (!uuidPattern.test(communityId) || !uuidPattern.test(accountId)) {
    redirect(route + "?error=membership");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Only the community owner may approve/reject membership requests.
  const { data: community } = await supabase
    .from("communities")
    .select("owner_creator_identity_id")
    .eq("id", communityId)
    .maybeSingle();

  const creatorId = community?.owner_creator_identity_id;
  if (!creatorId) {
    redirect(route + "?error=membership");
  }

  const { data: identity } = await supabase
    .from("creator_identities")
    .select("owner_account_id")
    .eq("id", creatorId)
    .maybeSingle();

  if (identity?.owner_account_id !== user.id) {
    redirect(route + "?error=membership");
  }

  const { error } = await supabase
    .from("community_memberships")
    .update({ status: "active", joined_at: new Date().toISOString() })
    .eq("community_id", communityId)
    .eq("account_id", accountId)
    .eq("status", "requested");

  if (error) redirect(route + "?error=membership");
  revalidatePath(route);
}

export async function rejectMembershipAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const communityId = String(formData.get("community_id") ?? "").trim();
  const accountId = String(formData.get("account_id") ?? "").trim();
  const route = `/${locale}/communities/${communityId}`;

  if (!uuidPattern.test(communityId) || !uuidPattern.test(accountId)) {
    redirect(route + "?error=membership");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: community } = await supabase
    .from("communities")
    .select("owner_creator_identity_id")
    .eq("id", communityId)
    .maybeSingle();

  const creatorId = community?.owner_creator_identity_id;
  if (!creatorId) {
    redirect(route + "?error=membership");
  }

  const { data: identity } = await supabase
    .from("creator_identities")
    .select("owner_account_id")
    .eq("id", creatorId)
    .maybeSingle();

  if (identity?.owner_account_id !== user.id) {
    redirect(route + "?error=membership");
  }

  const { error } = await supabase
    .from("community_memberships")
    .delete()
    .eq("community_id", communityId)
    .eq("account_id", accountId)
    .eq("status", "requested");

  if (error) redirect(route + "?error=membership");
  revalidatePath(route);
}
