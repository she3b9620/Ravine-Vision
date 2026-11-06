import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

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
      if (user) await supabase.from("profiles").upsert({ id: user.id, display_name: String(user.user_metadata?.display_name ?? "") }, { onConflict: "id", ignoreDuplicates: true });
      return NextResponse.redirect(origin + "/" + locale + "/profile");
    }
  }
  return NextResponse.redirect(origin + "/" + locale + "/login?error=callback");
}
