import { useEffect, useMemo, useReducer, useState } from "react";
import { reducer, loadState, saveState, TODAY } from "./state.js";
import { PATHWAYS_BY_ID } from "./data/demo.js";
import { buildWorklist } from "./engine/priority.js";
import Worklist from "./components/Worklist.jsx";
import CallAgent from "./components/CallAgent.jsx";
import VerifyRegister from "./components/VerifyRegister.jsx";
import NurseQueue from "./components/NurseQueue.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Pathways from "./components/Pathways.jsx";
import Landing from "./components/Landing.jsx";
import Activity from "./components/Activity.jsx";
import Icon, { Brand } from "./components/Icon.jsx";
const TABS = [
 {id:"worklist",label:"Follow-up worklist",icon:"users"},
 {id:"call",label:"Outreach agent",icon:"phone"},
 {id:"verify",label:"Verify register",icon:"file"},
 {id:"nurse",label:"Nurse queue",icon:"heart"},
 {id:"dashboard",label:"Barrier dashboard",icon:"chart"},
 {id:"activity",label:"Activity trail",icon:"log"},
 {id:"pathways",label:"Pathways & safety",icon:"shield"},
];
const initialTab=()=>["home",...TABS.map(t=>t.id)].includes(location.hash.slice(1))?location.hash.slice(1):"home";
export default function App() {
 const [state,dispatch]=useReducer(reducer,undefined,loadState);
 const [tab,setTab]=useState(initialTab);
 const [guided,setGuided]=useState(false);
 const [watch,setWatch]=useState(false);
 useEffect(()=>{saveState(state);},[state]);
 useEffect(()=>{const sync=()=>{setTab(initialTab());window.scrollTo(0,0);};window.addEventListener("hashchange",sync);window.addEventListener("popstate",sync);return()=>{window.removeEventListener("hashchange",sync);window.removeEventListener("popstate",sync);};},[]);
 const go=(id)=>{setTab(id);history.pushState(null,"","#"+id);window.scrollTo(0,0);};
 useEffect(()=>{document.title=tab==="home"?"Setu · A bridge back to care":(TABS.find(t=>t.id===tab)?.label||"Workspace")+" · Setu";},[tab]);
 useEffect(()=>{if(!watch)return;const handler=e=>{if(e.key==="Escape")setWatch(false);};const old=document.body.style.overflow;document.body.style.overflow="hidden";document.addEventListener("keydown",handler);return()=>{document.body.style.overflow=old;document.removeEventListener("keydown",handler);};},[watch]);
 const worklist=useMemo(()=>buildWorklist(state.patients,PATHWAYS_BY_ID,TODAY,state.tiers),[state.patients,state.tiers]);
 const openNurse=state.nurseQueue.filter(n=>n.status==="open");
 const pending=state.registerRows.filter(r=>r.status==="pending").length;
 const badge={nurse:openNurse.length,verify:pending};
 const start=(id)=>{dispatch({type:"SELECT_PATIENT",id});go("call");};
 const reset=()=>{if(confirm("Reset this browser's fictional records and activity?")){dispatch({type:"RESET"});setGuided(false);go("worklist");}};
 const guide=()=>{const shanti=state.patients.find(p=>p.firstName==="Shanti");if(shanti?.status!=="open"){if(!confirm("Start the guided case with fresh fictional records?"))return;dispatch({type:"RESET"});}setGuided(true);go("worklist");};
 const shanti=state.patients.find(p=>p.firstName==="Shanti");
 const guideText=shanti?.status==="returned"?"Return confirmed. Open the barrier dashboard to see the completed loop.":shanti?.status==="rebooked"?"A booking is not a return. Record Shanti's simulated check-in from the worklist.":tab==="call"?"Choose English. Verify with 1974, then choose the Ayushman card and bus fare reply.":"Find Shanti Devi and choose Start outreach. Follow her from a missed visit to a confirmed return.";
 return <>
 {tab==="home"?<Landing onExplore={()=>go("worklist")} onGuided={guide} onWatch={()=>setWatch(true)}/>:<div className="workspace">
  <aside className="app-sidebar"><button className="brand-link sidebar-brand" onClick={()=>go("home")} aria-label="Setu home"><Brand/></button><div className="workspace-label">CARE WORKSPACE</div><nav className="side-nav" aria-label="Care workspace">{TABS.map(t=><button role="tab" aria-selected={tab===t.id} key={t.id} className={tab===t.id?"active":""} onClick={()=>go(t.id)}><Icon name={t.icon} size={19}/><span>{t.label}</span>{badge[t.id]>0&&<b className={t.id==="nurse"?"urgent":""}>{badge[t.id]}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-demo"><span className="live-dot"/> Interactive prototype<p>Fictional records.<br/>Real workflow interactions.</p></div><button onClick={()=>go("home")}><Icon name="home" size={17}/> Back to introduction</button><a href="https://github.com/hannielvinu/Setu" target="_blank" rel="noreferrer">Team MedNova <Icon name="arrow" size={15}/></a></div></aside>
  <div className="app-content"><header className="workspace-header"><div><span className="header-breadcrumb">Workspace <span>/</span> {TABS.find(t=>t.id===tab)?.label}</span><span className="header-hospital">Arogya Hospital · Demo</span></div><div className="row gap"><span className="workspace-date">{new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"}).format(TODAY)}</span><button className="icon-btn" title="Reset demo" aria-label="Reset demo" onClick={reset}><Icon name="reset" size={18}/></button><span className="user-avatar" title="Care coordinator demo">MC</span></div></header>
  <div className="simulation-notice"><Icon name="shield" size={14}/><span>Safe to explore. All patients are fictional. Calls and messages are simulated.</span><button onClick={()=>setWatch(true)}>Watch walkthrough <Icon name="play" size={12}/></button></div>
  <main className="main workspace-main">
   {guided&&<div className="guided-banner"><span className="guided-icon"><Icon name="arrow"/></span><div><strong>Shanti's journey</strong><p>{guideText}</p></div><button className="icon-btn" aria-label="Dismiss guided journey" onClick={()=>setGuided(false)}><Icon name="close" size={18}/></button></div>}
   {tab==="worklist"&&<Worklist worklist={worklist} onStart={start} dispatch={dispatch} onConfirmAttendance={id=>dispatch({type:"CONFIRM_ATTENDANCE",id})}/>}
   {tab==="call"&&<CallAgent state={state} dispatch={dispatch} worklist={worklist} goTo={go}/>}
   {tab==="verify"&&<VerifyRegister state={state} dispatch={dispatch} goTo={go}/>}
   {tab==="nurse"&&<NurseQueue state={state} dispatch={dispatch}/>}
   {tab==="dashboard"&&<Dashboard state={state} worklist={worklist}/>}
   {tab==="activity"&&<Activity state={state}/>}
   {tab==="pathways"&&<Pathways state={state} dispatch={dispatch}/>}
  </main><footer className="workspace-footer"><span><Icon name="shield" size={13}/> Assistive follow-up. Every clinical decision stays with the care team.</span><span>MedNova · AOILMY</span></footer></div>
 </div>}
 {watch&&<div className="video-overlay" role="dialog" aria-modal="true" aria-label="Setu walkthrough" onClick={e=>{if(e.target===e.currentTarget)setWatch(false);}}><div className="video-modal"><div><strong>Setu · A bridge back to care</strong><button className="icon-btn" aria-label="Close video" autoFocus onClick={()=>setWatch(false)}><Icon name="close"/></button></div><video controls autoPlay playsInline preload="metadata" src="./round2-demo.mp4"><track kind="captions" src="./round2-demo.vtt" srcLang="en" label="English" default/></video><p>Fictional case study · Neural voice narration · Interactive browser prototype</p></div></div>}
 </>;
}
