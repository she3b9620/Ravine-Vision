"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
const catalog = {
 ar: [
  {id:"all",label:"كل العوالم",title:"اكتشف ما يستحق انتباهك",desc:"مساحة اكتشاف متعددة الأشكال، تراعي السياق والجودة والتنوع."},
  {id:"cinema",label:"السينما والصورة",title:"السينما والصورة",desc:"أفلام روائية وقصيرة ووثائقيات ومسلسلات وتجارب بصرية."},
  {id:"audio",label:"الصوت والحوار",title:"الصوت والحوار",desc:"بودكاست وحوارات وتجارب صوتية ومساحات مباشرة."},
  {id:"arts",label:"الفنون",title:"الفنون والتعبير",desc:"تصوير وموسيقى وفنون بصرية وأشكال تعبير متنوعة."},
  {id:"knowledge",label:"المعرفة والفكر",title:"المعرفة والفكر",desc:"كتب وأبحاث ومحاضرات وفلسفة وعلوم وأسئلة مفتوحة."},
  {id:"human",label:"التجارب الإنسانية",title:"التجارب الإنسانية",desc:"شهادات وذاكرة وثقافة وتقاليد وحكايات من الحياة."}
 ],
 en: [
  {id:"all",label:"All worlds",title:"Discover what deserves your attention",desc:"A multidimensional discovery space shaped by context, quality, and diversity."},
  {id:"cinema",label:"Cinema & image",title:"Cinema & image",desc:"Feature and short films, documentaries, series, and visual experiences."},
  {id:"audio",label:"Sound & dialogue",title:"Sound & dialogue",desc:"Podcasts, conversations, audio experiences, and live spaces."},
  {id:"arts",label:"Arts",title:"Arts & expression",desc:"Photography, music, visual arts, and diverse forms of expression."},
  {id:"knowledge",label:"Knowledge",title:"Knowledge & thought",desc:"Books, research, lectures, philosophy, science, and open questions."},
  {id:"human",label:"Human stories",title:"Human experience",desc:"Testimony, memory, culture, traditions, and lived stories."}
 ]};
export default function DiscoverPage(){
 const params=useParams<{locale:string}>();
 const ar=params.locale==="ar";const items=catalog[ar?"ar":"en"];const [active,setActive]=useState("all");const selected=useMemo(()=>items.find(x=>x.id===active)??items[0],[items,active]);
 return <main className="rv-discover-page" dir={ar?"rtl":"ltr"}>
  <header className="rv-discover-header"><a className="rv-brand" href={`/${params.locale}`}><span>RAVINE<small>THE PATH TO LIGHT</small></span></a><nav><a href={`/${params.locale}/works`}>{ar?"الأعمال":"Works"}</a><a href={`/${params.locale}/creators`}>{ar?"المبدعون":"Creators"}</a><a href={`/${params.locale}/communities`}>{ar?"المجتمعات":"Communities"}</a></nav><a className="rv-discover-profile" href={`/${params.locale}/profile`}>{ar?"مساحتك":"Your space"} ↗</a></header>
  <section className="rv-discover-hero"><p className="rv-kicker"><i/>RAVINE / DISCOVER</p><h1>{ar?"فضولك هو بداية الطريق.":"Let curiosity lead the way."}</h1><p>{ar?"لا نرتب العالم بحسب الضجيج. ابدأ من اهتمامك، واكتشف أعمالًا وأفكارًا وأشخاصًا وسياقات جديدة.":"We do not rank the world by noise. Start with an interest, and discover works, ideas, people, and new contexts."}</p></section>
  <section className="rv-discover-catalog"><div className="rv-discover-heading"><div><p className="rv-kicker"><i/>EXPLORE BY INTEREST</p><h2>{ar?"اختر مسارك":"Choose a path"}</h2></div><span>{ar?"تصنيفات رافين":"RAVINE WORLDS"}</span></div>
   <div className="rv-discover-tabs" role="group" aria-label={ar?"تصنيفات الاكتشاف":"Discovery categories"}>{items.map(x=><button key={x.id} type="button" className={active===x.id?"active":""} aria-pressed={active===x.id} onClick={()=>setActive(x.id)}>{x.label}</button>)}</div>
   <article className="rv-discover-selection"><span>{active==="all"?"R / 00":`R / 0${items.findIndex(x=>x.id===active)}`}</span><div><h3>{selected.title}</h3><p>{selected.desc}</p><small>{ar?"التصنيف يحدد شكل الاكتشاف، وليس قيمة العمل أو صاحبه.":"Categories shape discovery, not the value of a work or its creator."}</small></div></article>
   <div className="rv-discover-next"><a href={`/${params.locale}/works`}>{ar?"تصفح أنواع الأعمال":"Browse work formats"} ↗</a><a href={`/${params.locale}/creators`}>{ar?"اكتشف المبدعين":"Meet creators"} ↗</a><a href={`/${params.locale}/communities`}>{ar?"اعثر على مجتمعك":"Find your communities"} ↗</a></div>
  </section>
  <footer className="rv-home-footer"><a className="rv-brand" href={`/${params.locale}`}><span>RAVINE<small>THE PATH TO LIGHT</small></span></a><span>{ar?"الكرامة · الإبداع · المعرفة · التقارب الإنساني":"Dignity · Creativity · Knowledge · Human connection"}</span><span>© RAVINE</span></footer>
 </main>;
}