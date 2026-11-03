import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") === "en" ? "en" : "ar";
  if (code) {
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
