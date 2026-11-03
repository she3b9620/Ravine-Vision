"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const declarations=["creator_asserted","licensed","public_domain","commissioned","permission_pending","unknown"];

export async function submitRightsDeclaration(formData:FormData){
 const locale=String(formData.get("locale")??"ar")==="en"?"en":"ar";
 const base="/"+locale+"/creator/library";
 const workId=String(formData.get("work_id")??"");
 const declaration=String(formData.get("declaration")??"");
 const attribution=String(formData.get("attribution_text")??"").trim();
 const license=String(formData.get("license_reference")??"").trim();
 const evidence=String(formData.get("evidence_references")??"").split("\n").map(x=>x.trim()).filter(Boolean).slice(0,10);
 if(!workId||!declarations.includes(declaration)||attribution.length>1000||license.length>1000||evidence.some(x=>x.length>500)) redirect(base+"?error=rights_validation");
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/"+locale+"/login");
 const {data:work}=await supabase.from("works").select("id").eq("id",workId).eq("created_by",user.id).eq("status","draft").maybeSingle();
 if(!work) redirect(base+"?error=rights_unavailable");
 const {error}=await supabase.from("rights_declarations").insert({
  work_id:work.id,claimant_account_id:user.id,declaration,
  attribution_text:attribution||null,license_reference:license||null,
  evidence_references:evidence
 });
 if(error) redirect(base+"?error=rights_save");
 redirect(base+"/"+workId+"/rights?submitted=1");
}
