import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";
import { getSupabaseEnvironment } from "./env";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function loginPath(locale: string): string {
  return "/" + (locale === "en" ? "en" : "ar") + "/login";
}

/**
 * Session guard for authenticated pages.
 *
 * Returns the Supabase client and the signed-in user, or redirects to sign-in.
 *
 * Two behaviours matter here:
 * - a missing/unreachable backend redirects with `error=backend` instead of
 *   throwing a 500 (an unconfigured deployment previously crashed every
 *   authenticated route);
 * - an absent session redirects to the plain sign-in page, so a legitimate
 *   visitor is never shown a backend error.
 */
export async function requireUser(
  locale: string,
): Promise<{ supabase: ServerClient; user: User }> {
  const login = loginPath(locale);

  if (!getSupabaseEnvironment()) redirect(login + "?error=backend");

  const supabase = await createClient();

  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect(login + "?error=backend");
  }

  if (!user) redirect(login);

  return { supabase, user };
}
