import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnvironment } from "./env";

export function createClient() {
  const { url, publishableKey } = requireSupabaseEnvironment();
  return createBrowserClient(url, publishableKey);
}
