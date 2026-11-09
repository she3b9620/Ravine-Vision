"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { getSiteOrigin } from "@/lib/site-origin";
import { resolveDisplayName } from "@/lib/display-name";

const path = (locale: string, route: string) => "/" + (locale === "en" ? "en" : "ar") + route;

// These actions run from the public /login page, which renders fine without a
// backend. Guard before touching Supabase so a misconfigured deployment shows a
// clear message instead of a 500.
function requireBackend(locale: string) {
  if (!getSupabaseEnvironment()) redirect(path(locale, "/login?error=backend"));
}

export async function signInAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(path(locale, "/login?error=missing"));
  requireBackend(locale);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(path(locale, "/login?error=credentials"));
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const displayName = resolveDisplayName(user.user_metadata);
    await supabase.from("profiles").upsert({ id: user.id, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });
    if (displayName) {
      // Fill a profile created before provider metadata was understood, but never
      // overwrite a name the account holder has since chosen.
      await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id).eq("display_name", "");
    }
  }
  redirect(path(locale, "/profile"));
}

export async function signUpAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!displayName || !email || password.length < 10) redirect(path(locale, "/login?error=invalid"));
  requireBackend(locale);
  const supabase = await createClient();
  const origin = await getSiteOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: origin + "/" + (locale === "en" ? "en" : "ar") + "/auth/callback",
    },
  });
  if (error) redirect(path(locale, "/login?error=signup"));
  redirect(path(locale, "/login?check_email=1"));
}

export async function signOutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  requireBackend(locale);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(path(locale, ""));
}

export async function signInWithGoogleAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  requireBackend(locale);
  const supabase = await createClient();
  const origin = await getSiteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: origin + "/" + locale + "/auth/callback",
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error || !data.url) redirect(path(locale, "/login?error=callback"));
  redirect(data.url);
}
