"use server";
import {redirect} from "next/navigation";
import {requireUser} from "@/lib/supabase/session";
const targetTypes=["account","creator_identity","work","comment","community","message","live_session"];
const categories=["harassment","threat","privacy","impersonation","copyright","spam","fraud","misinformation_context","other"];
export async function submitSafetyReport(formData:FormData){
 const locale=String(formData.get("locale")??"ar")==="en"?"en":"ar";
 const targetType=String(formData.get("target_type")??"");const targetId=String(formData.get("target_id")??"").trim();
 const category=String(formData.get("category")??"");const explanation=String(formData.get("explanation")??"").trim();
 const evidenceText=String(formData.get("evidence_references")??"").trim();
 const evidence=evidenceText?evidenceText.split("\n").map(x=>x.trim()).filter(Boolean):[];
 if(!targetTypes.includes(targetType)||!targetId||! /^[0-9a-f-]{36}$/i.test(targetId)||!categories.includes(category)||explanation.length>4000||evidence.length>10||evidence.some(x=>x.length>1000))redirect("/"+locale+"/report?error=validation");
 const { supabase, user } = await requireUser(locale);
 const {error}=await supabase.from("safety_reports").insert({reporter_account_id:user.id,target_type:targetType,target_id:targetId,category,explanation:explanation||null,evidence_references:evidence});
 if(error)redirect("/"+locale+"/report?error=save");redirect("/"+locale+"/report?done=1");
}
