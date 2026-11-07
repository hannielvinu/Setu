import { useState } from "react";
import { HISTORY } from "../data/demo.js";
import { BARRIERS } from "../engine/classifier.js";
import Icon from "./Icon.jsx";
const LABELS={...Object.fromEntries(Object.entries(BARRIERS).map(([k,v])=>[k,v.label])),other:"Other / unclear"};
export default function Dashboard({state,worklist}) {
 const [illustrative,setIllustrative]=useState(false);
 const counts={...(illustrative?HISTORY.barrierCounts:{})};
 for(const [k,v]of Object.entries(state.session.barrierCounts))counts[k]=(counts[k]||0)+v;
 const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 const max=sorted[0]?.[1]||1,total=Object.values(counts).reduce((a,b)=>a+b,0);
 const overdue=worklist.filter(r=>r.a.overdue&&r.patient.status!=="returned").length;
 const returned=state.patients.filter(p=>p.status==="returned").length;
 const calls=state.calls.length;
 const funnel=state.session.funnel;
 return <section><div className="page-head"><div><span className="eyebrow">UNDERSTAND WHAT KEEPS PEOPLE AWAY</span><h1>Barrier dashboard</h1><p className="lede">Your demo session, as it happened. Rebooking and confirmed returns stay separate.</p></div><label className="toggle"><input type="checkbox" checked={illustrative} onChange={e=>setIllustrative(e.target.checked)}/> Add illustrative barrier baseline</label></div>
 <div className="kpis">{[[overdue,"Outstanding overdue visits"],[calls,"Simulated outreach outcomes"],[funnel.rebooked,"Rebooked this session"],[returned,"Returns confirmed (demo session)"],[state.nurseQueue.length,"Nurse reviews created"],[state.nurseQueue.filter(n=>n.status==="open").length,"Nurse reviews open"]].map(([v,label])=><div className="kpi card" key={label}><span className="kpi-l">{label}</span><span className="kpi-n">{v}</span></div>)}</div>
 <div className="dash-grid"><div className="card pad"><h3>What patients told the team</h3><p className="note">{illustrative?"Illustrative 30-day sample plus this session. These are not pilot results.":"Only barriers captured in your current demo session."}</p><div className="bars">{sorted.length?sorted.map(([k,v])=><div className="bar-row" key={k}><span className="bar-label">{LABELS[k]}</span><span className="bar-track"><span className="bar-fill" style={{width:v/max*100+"%"}}/></span><span className="bar-val">{v} <em>{Math.round(v/total*100)}%</em></span></div>):<div className="dashboard-empty"><Icon name="chart" size={32}/><strong>A clearer picture starts with a conversation</strong><p>Complete an outreach to see the barrier breakdown.</p></div>}</div>{sorted.length>0&&<div className="insight"><strong>Start with {LABELS[sorted[0][0]].toLowerCase()}</strong><span>Review these fictional cases with the coordinator and document the next practical action.</span></div>}</div>
 <div className="card pad"><h3>From first contact to return</h3><div className="session-funnel">{[["reached","Simulated calls connected"],["verified","Identity verified"],["barrierCaptured","Barrier captured"],["rebooked","Visit rebooked"]].map(([k,label],i)=><div key={k}><span className="funnel-number">{i+1}</span><span>{label}</span><strong>{funnel[k]||0}</strong></div>)}<div className="funnel-return"><Icon name="check" size={18}/><span>Check-in confirmed</span><strong>{returned}</strong></div></div><p className="note">Counts are demo events, not measured patient outcomes. A hospital pilot must track attendance against its own records.</p></div></div>
 <div className="card pad"><h3>Recent outreach outcomes</h3>{state.calls.length?<ul className="recent-outcomes">{state.calls.slice(0,8).map((c,i)=><li key={i}><span className="avatar">{c.name?.split(" ").map(s=>s[0]).slice(0,2).join("")}</span><div><strong>{c.name}</strong><p>{c.barriers.map(b=>LABELS[b]||b).join(" · ")||"No barrier disclosed"}</p></div><span className="status">{c.outcome.replaceAll("_"," ")}</span></li>)}</ul>:<p className="note">No completed outreach yet. Start with Shanti in the follow-up worklist.</p>}</div></section>;
}
