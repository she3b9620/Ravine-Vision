"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const route = (locale: string) => "/" + (locale === "en" ? "en" : "ar") + "/creator/team";

export async function inviteCreatorTeamMember(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const creatorIdentityId = String(formData.get("creator_identity_id") ?? "");
  const invitedAccountId = String(formData.get("invited_account_id") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(creatorIdentityId) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invitedAccountId) ||
      !["manager","editor","analyst"].includes(role)) redirect(route(locale) + "?error=validation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + (locale === "en" ? "en" : "ar") + "/login");
  const { error } = await supabase.from("creator_team_invitations").insert({
    creator_identity_id: creatorIdentityId,
    invited_account_id: invitedAccountId,
    invited_by_account_id: user.id,
    role,
  });
  redirect(route(locale) + (error ? "?error=invite" : "?sent=1"));
}

export async function respondToCreatorTeamInvitation(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const invitationId = String(formData.get("invitation_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(invitationId) || !["accepted","declined"].includes(decision)) redirect(route(locale) + "?error=validation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + (locale === "en" ? "en" : "ar") + "/login");
  const { error } = await supabase.rpc("respond_to_creator_team_invitation", {
    p_invitation_id: invitationId,
    p_decision: decision,
  });
  redirect(route(locale) + (error ? "?error=response" : "?updated=1"));
}

export async function revokeCreatorTeamInvitation(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const invitationId = String(formData.get("invitation_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(invitationId)) redirect(route(locale) + "?error=validation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + (locale === "en" ? "en" : "ar") + "/login");
  const { error } = await supabase.rpc("revoke_creator_team_invitation", { p_invitation_id: invitationId });
  redirect(route(locale) + (error ? "?error=owner_action" : "?updated=1"));
}

export async function removeCreatorTeamMember(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const identityId = String(formData.get("creator_identity_id") ?? "");
  const memberId = String(formData.get("member_account_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(identityId) || !/^[0-9a-f-]{36}$/i.test(memberId)) redirect(route(locale) + "?error=validation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + (locale === "en" ? "en" : "ar") + "/login");
  const { error } = await supabase.rpc("remove_creator_team_member", {
    p_creator_identity_id: identityId,
    p_member_account_id: memberId,
  });
  redirect(route(locale) + (error ? "?error=owner_action" : "?updated=1"));
}
