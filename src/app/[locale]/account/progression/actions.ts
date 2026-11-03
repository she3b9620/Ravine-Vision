"use server";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
export async function requestAccountTier(formData:FormData){
 const locale=String(formData.get("locale")??"ar")==="en"?"en":"ar";
 const tier=String(formData.get("requested_tier")??"");const statement=String(formData.get("statement")??"").trim();
 const refs=String(formData.get("evidence_references")??"").split("\n").map(x=>x.trim()).filter(Boolean);
 if(!["creator","verified","select"].includes(tier)||statement.length<50||statement.length>4000||refs.length>10||refs.some(x=>x.length>1000))redirect("/"+locale+"/account/progression?error=validation");
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/"+locale+"/login");
 const {error}=await supabase.from("account_tier_requests").insert({account_id:user.id,requested_tier:tier,statement,evidence_references:refs});
 if(error)redirect("/"+locale+"/account/progression?error=save");redirect("/"+locale+"/account/progression?done=1");
}
