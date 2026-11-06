"use server";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
export async function reviewItem(formData:FormData){
 const locale=String(formData.get("locale")??"ar")==="en"?"en":"ar";
 const kind=String(formData.get("kind")??"");
 const id=String(formData.get("item_id")??"");
 const decision=String(formData.get("decision")??"");
 const notes=String(formData.get("notes")??"").trim();
 if(!id||notes.length>4000)redirect("/"+locale+"/review?error=validation");
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/"+locale+"/login");
 const {data:role}=await supabase.rpc("current_staff_role");
 if(!role||!["reviewer","moderator","admin","owner"].includes(role))redirect("/"+locale);
 let result;
 if(kind==="creator_application"&&["reviewer","admin","owner"].includes(role)&&["approved","rejected"].includes(decision)){
  result=await supabase.rpc("review_creator_application",{p_application_id:id,p_decision:decision,p_notes:notes||null});
 }else if(kind==="rights_declaration"&&["reviewer","admin","owner"].includes(role)&&["accepted","disputed","rejected"].includes(decision)){
  result=await supabase.rpc("review_rights_declaration",{p_declaration_id:id,p_decision:decision,p_notes:notes||null});
 }else if(kind==="account_tier_request"&&["reviewer","admin","owner"].includes(role)&&["approved","rejected"].includes(decision)){
  result=await supabase.rpc("review_account_tier_request",{p_request_id:id,p_decision:decision,p_notes:notes||null});
 }else if(kind==="work"&&["reviewer","admin","owner"].includes(role)&&["published","changes_requested"].includes(decision)){
  result=await supabase.rpc("review_work",{p_work_id:id,p_decision:decision,p_notes:notes||null});
 }else if(kind==="safety_report"&&["moderator","admin","owner"].includes(role)&&["triaged","actioned","dismissed","appealed"].includes(decision)){
  result=await supabase.rpc("review_safety_report",{p_report_id:id,p_decision:decision,p_notes:notes||null});
 }else redirect("/"+locale+"/review?error=permission");
 if(result.error)redirect("/"+locale+"/review?error=save");
 redirect("/"+locale+"/review?done=1");
}
