"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-origin";

const path = (locale: string, route: string) => "/" + (locale === "en" ? "en" : "ar") + route;

export async function signInAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(path(locale, "/login?error=missing"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(path(locale, "/login?error=credentials"));
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.from("profiles").upsert({ id: user.id, display_name: String(user.user_metadata?.display_name ?? "") }, { onConflict: "id", ignoreDuplicates: true });
  redirect(path(locale, "/profile"));
}

export async function signUpAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!displayName || !email || password.length < 10) redirect(path(locale, "/login?error=invalid"));
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
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(path(locale, ""));
}

export async function signInWithGoogleAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
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
