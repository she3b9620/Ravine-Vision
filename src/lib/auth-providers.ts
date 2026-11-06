import { getSupabaseEnvironment } from "./supabase/env";

export type AuthProviders = { google: boolean };

/**
 * Which external identity providers Supabase actually has enabled.
 *
 * The guest page must not offer "Continue with Google" when the provider is
 * disabled — that is a control which cannot work, which the charter forbids.
 *
 * Fails closed: if the settings call fails or the backend is unconfigured,
 * Google is treated as unavailable. Email sign-in is unaffected, so nobody is
 * locked out by this choice.
 */
export async function getAuthProviders(): Promise<AuthProviders> {
  const environment = getSupabaseEnvironment();
  if (!environment) return { google: false };

  try {
    const response = await fetch(`${environment.url}/auth/v1/settings`, {
      headers: { apikey: environment.publishableKey },
      next: { revalidate: 300 },
    });
    if (!response.ok) return { google: false };
    const settings = (await response.json()) as {
      external?: Record<string, boolean | undefined>;
    };
    return { google: settings.external?.google === true };
  } catch {
    return { google: false };
  }
}
