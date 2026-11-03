"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowed:Record<string,string[]>={
 video:["video/mp4","video/webm","video/quicktime"],
 audio:["audio/mpeg","audio/mp4","audio/wav","audio/ogg","audio/webm"],
 image:["image/jpeg","image/png","image/webp","image/avif"],
 document:["application/pdf"]
};
export async function registerMediaIntent(formData:FormData){
 const locale=String(formData.get("locale")??"ar")==="en"?"en":"ar";
 const workId=String(formData.get("work_id")??"");
 const kind=String(formData.get("asset_kind")??"");
 const mime=String(formData.get("mime_type")??"").toLowerCase();
 const bytes=Number(formData.get("byte_size")??0);
 const base="/"+locale+"/creator/library/"+workId+"/media";
 if(!workId||!allowed[kind]?.includes(mime)||!Number.isSafeInteger(bytes)||bytes<1||bytes>5*1024*1024*1024) redirect(base+"?error=validation");
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/"+locale+"/login");
 const {data:work}=await supabase.from("works").select("id").eq("id",workId).eq("created_by",user.id).eq("status","draft").maybeSingle();
 if(!work) redirect("/"+locale+"/creator/library?error=unavailable");
 const {error}=await supabase.from("media_assets").insert({owner_account_id:user.id,asset_kind:kind,mime_type:mime,byte_size:bytes});
 if(error) redirect(base+"?error=save");
 redirect(base+"?registered=1");
}
