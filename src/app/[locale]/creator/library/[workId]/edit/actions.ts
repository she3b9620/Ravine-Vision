"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function updateWorkDraft(formData: FormData) {
 const locale=String(formData.get("locale")??"ar")==="en"?"en":"ar";
 const base="/"+locale+"/creator/library";
 const workId=String(formData.get("work_id")??"");
 const title=String(formData.get("title")??"").trim();
 const synopsis=String(formData.get("synopsis")??"").trim();
 const kind=String(formData.get("kind")??"");
 const language=String(formData.get("language_code")??"ar");
 const visibility=String(formData.get("visibility")??"private");
 if(!workId||title.length<2||title.length>160||synopsis.length>3000||!["short","video","podcast","documentary","short_film","feature_film","series","photography","visual_art","music","writing","book","research","lecture","conversation","archive","other"].includes(kind)||!["ar","en","und"].includes(language)||!["public","unlisted","private"].includes(visibility)) redirect(base+"?error=validation");
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/"+locale+"/login");
 const {data:work}=await supabase.from("works").select("id").eq("id",workId).eq("created_by",user.id).eq("status","draft").maybeSingle();
 if(!work) redirect(base+"?error=unavailable");
 const {error}=await supabase.from("works").update({title,synopsis:synopsis||null,kind,language_code:language,visibility,updated_at:new Date().toISOString()}).eq("id",workId);
 if(error) redirect(base+"?error=save");
 redirect(base+"?updated=1");
}