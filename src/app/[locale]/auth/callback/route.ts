import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { resolveDisplayName } from "@/lib/display-name";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = await params;
  const locale = routeLocale === "en" ? "en" : "ar";
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    // Reachable directly from a confirmation link, so it must not throw when the
    // backend is unconfigured.
    if (!getSupabaseEnvironment()) {
      return NextResponse.redirect(origin + "/" + locale + "/login?error=backend");
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const displayName = resolveDisplayName(user.user_metadata);
        await supabase.from("profiles").upsert({ id: user.id, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });
        if (displayName) {
          // Google sends full_name/name rather than display_name. Fill the empty
          // profile this flow created before the distinction was handled, without
          // overwriting a name the account holder later chose.
          await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id).eq("display_name", "");
        }
      }
      return NextResponse.redirect(origin + "/" + locale + "/profile");
    }
  }
  return NextResponse.redirect(origin + "/" + locale + "/login?error=callback");
}
