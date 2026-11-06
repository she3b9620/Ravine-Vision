"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitWorkForReview(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar") === "en" ? "en" : "ar";
  const base = "/" + locale + "/creator/library";
  const workId = String(formData.get("work_id") ?? "");
  if (!workId) redirect(base + "?error=validation");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/" + locale + "/login");

  const { error } = await supabase.rpc("submit_work_for_review", { p_work_id: workId });
  if (error) redirect(base + "?error=submit");

  redirect(base + "?submitted=1");
}
